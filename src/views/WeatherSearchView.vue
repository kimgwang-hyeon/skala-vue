<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import LocationSuggestionList from '@/components/exercise/LocationSuggestionList.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { fetchCurrentWeather, reverseGeocodeLocation } from '@/api/weatherApi.js'
import { isValidLocationQuery, useLocationSearch } from '@/composables/useLocationSearch.js'
import { createLocationFromGeocode, useWeatherStore } from '@/stores/weatherStore.js'
import {
  getApiRecentSearches,
  saveApiRecentSearches,
} from '@/utils/weatherStorage.js'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()

const getQueryText = (queryValue) => {
  return typeof queryValue === 'string' ? queryValue : ''
}

const searchQuery = ref(getQueryText(route.query.q))
const searchWeatherList = ref([])
const selectedLocation = ref(null)
const isSearching = ref(false)
const isLocating = ref(false)
const hasSearched = ref(false)
const searchError = ref('')
const searchStatus = ref('지역명을 입력하고 카카오 검색 후보에서 한 곳을 선택해 보세요.')
const recentApiSearches = ref(getApiRecentSearches())

// 카카오 후보 조회는 도시 비교 화면과 공유하는 합성 함수에 위임
const locationSearch = useLocationSearch()

const isApiQueryValid = computed(() => {
  return isValidLocationQuery(searchQuery.value)
})

const showLocationSuggestions = computed(() => {
  return (
    locationSearch.isSuggesting.value ||
    (!selectedLocation.value &&
      isApiQueryValid.value &&
      (locationSearch.suggestions.value.length > 0 ||
        locationSearch.hasRequested.value ||
        Boolean(locationSearch.errorMessage.value)))
  )
})

// computed 실습: 검색 결과 중 즐겨찾기와 대시보드 등록 개수 계산
const searchResultSummary = computed(() => {
  return {
    total: searchWeatherList.value.length,
    favorites: searchWeatherList.value.filter((item) => {
      return weatherStore.isFavorite(item.locationKey)
    }).length,
    dashboard: searchWeatherList.value.filter((item) => {
      return weatherStore.isInDashboard(item.locationKey)
    }).length,
  }
})

const createWeatherItem = (location, apiWeather) => {
  return {
    ...apiWeather,
    id: location.key,
    locationKey: location.key,
    name: location.name,
    state: location.state,
    country: location.country,
    coord: { ...location.coord },
  }
}

// 지역 선택과 현재 위치 검색이 같은 순번을 공유해야 서로의 낡은 응답을 무효화할 수 있음
let weatherRequestId = 0

// 검색어를 URL query와 동기화하여 새로고침·뒤로가기에도 유지
watch(searchQuery, (newQuery) => {
  const query = newQuery.trim()
  searchError.value = ''

  if (query === getQueryText(route.query.q)) {
    return
  }

  router.replace({
    name: 'search',
    query: { q: query || undefined },
  })
})

watch(
  () => route.query.q,
  (newQuery) => {
    const query = getQueryText(newQuery)

    if (searchQuery.value !== query) {
      handleUpdateQuery(query)
    }
  },
)

// watch 실습: 입력을 잠시 멈춘 뒤에만 카카오 지역 후보를 자동 조회
watch(searchQuery, (newQuery, _oldQuery, onCleanup) => {
  const query = newQuery.trim()

  // 이미 고른 도시의 이름이 그대로 남아 있으면 다시 조회하지 않음
  if (selectedLocation.value?.name === query) {
    locationSearch.stopScheduledSearch()
    return
  }

  locationSearch.scheduleSearch(query)

  onCleanup(() => {
    locationSearch.stopScheduledSearch()
  })
})

// API 검색 기록이 바뀐 뒤에만 localStorage에 저장
watch(
  recentApiSearches,
  (newSearches) => {
    saveApiRecentSearches(newSearches)
  },
  { deep: true },
)

const handleUpdateQuery = (newQuery) => {
  if (newQuery !== searchQuery.value) {
    locationSearch.reset()
    selectedLocation.value = null
    searchWeatherList.value = []
    hasSearched.value = false
    searchError.value = ''
  }

  searchQuery.value = newQuery
}

const rememberApiSearch = (query) => {
  recentApiSearches.value = [
    query,
    ...recentApiSearches.value.filter((item) => item !== query),
  ].slice(0, 5)
}

// 검색 버튼·Enter로 조회할 때는 진행 상황을 상태 바에도 알림
const searchLocationsWithStatus = async (query) => {
  searchStatus.value = `${query}의 카카오 지역 후보를 찾고 있습니다.`

  const suggestions = await locationSearch.search(query)

  if (locationSearch.errorMessage.value) {
    searchStatus.value = '카카오 지역 검색을 완료하지 못했습니다.'
    return suggestions
  }

  searchStatus.value =
    suggestions.length > 0
      ? `${suggestions.length}개의 지역 후보를 찾았습니다. 한 곳을 선택해 주세요.`
      : `${query}에 해당하는 대한민국 행정구역을 찾지 못했습니다.`

  return suggestions
}

const handleSelectLocation = async (location) => {
  const requestId = ++weatherRequestId

  // 후보 목록을 비워 선택 직후 드롭다운이 닫히도록 함
  locationSearch.reset()
  selectedLocation.value = location
  searchQuery.value = location.name
  isSearching.value = true
  hasSearched.value = true
  searchError.value = ''
  searchWeatherList.value = []
  searchStatus.value = `${location.addressName || location.name}의 날씨를 불러오고 있습니다.`

  // 선택한 카카오 좌표를 Pinia에 기억해 상세 라우트에서도 재사용
  weatherStore.rememberLocations([location])

  try {
    const weatherResponse = await fetchCurrentWeather(location.coord)

    // 그 사이 다른 지역이나 현재 위치를 조회했다면 낡은 응답이므로 폐기
    if (requestId !== weatherRequestId) {
      return
    }

    searchWeatherList.value = [createWeatherItem(location, weatherResponse.data)]
    rememberApiSearch(location.name)
    searchStatus.value = `${location.name} 현재 날씨를 표시했습니다.`
  } catch (error) {
    if (requestId !== weatherRequestId) {
      return
    }

    searchError.value =
      error.response?.status === 401
        ? 'OpenWeather API 키를 확인해 주세요.'
        : `${location.name}의 날씨를 불러오지 못했습니다.`
    searchStatus.value = '선택한 지역의 날씨 조회를 완료하지 못했습니다.'
  } finally {
    if (requestId === weatherRequestId) {
      isSearching.value = false
    }
  }
}

const handleSubmitSearch = async () => {
  const query = searchQuery.value.trim()

  if (!isApiQueryValid.value) {
    searchStatus.value = '지역 검색은 서울처럼 완성된 이름을 두 글자 이상 입력해 주세요.'
    return
  }

  locationSearch.stopScheduledSearch()

  if (selectedLocation.value?.name === query) {
    await handleSelectLocation(selectedLocation.value)
    return
  }

  const suggestions = await searchLocationsWithStatus(query)

  if (suggestions.length === 0) {
    hasSearched.value = true
    return
  }

  const compactQuery = query.replaceAll(' ', '')
  const exactLocation = suggestions.find((location) => {
    return [location.name, location.addressName].some((name) => {
      return name?.replaceAll(' ', '') === compactQuery
    })
  })

  // 완성된 지역명이거나 후보가 하나뿐이면 Enter·검색 버튼으로 바로 선택
  if (exactLocation || suggestions.length === 1) {
    await handleSelectLocation(exactLocation ?? suggestions[0])
  }
}

const getCurrentCoordinates = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  })
}

// 버튼을 누른 경우에만 위치 권한을 요청하고, 역지오코딩 후 기존 카드 형태로 표시
const handleSearchCurrentLocation = async () => {
  if (!navigator.geolocation) {
    searchError.value = '이 브라우저는 현재 위치 기능을 지원하지 않습니다.'
    return
  }

  isLocating.value = true
  const requestId = ++weatherRequestId
  locationSearch.reset()
  selectedLocation.value = null
  hasSearched.value = true
  searchError.value = ''
  searchWeatherList.value = []
  searchStatus.value = '현재 위치와 도시명을 확인하고 있습니다.'

  try {
    const coordinates = await getCurrentCoordinates()
    const geocodeResponse = await reverseGeocodeLocation(coordinates)
    const geocode = geocodeResponse.data[0]

    // 위치 확인을 기다리는 동안 사용자가 지역을 검색했다면 그쪽 결과를 유지
    if (requestId !== weatherRequestId) {
      return
    }

    if (!geocode) {
      throw new Error('REVERSE_GEOCODE_EMPTY')
    }

    if (geocode.country !== 'KR') {
      searchStatus.value = '현재 위치가 대한민국 외지역이라 검색 결과에서 제외했습니다.'
      return
    }

    const location = createLocationFromGeocode(geocode)
    selectedLocation.value = location
    searchQuery.value = location.name
    const weatherResponse = await fetchCurrentWeather(location.coord)

    if (requestId !== weatherRequestId) {
      return
    }

    weatherStore.rememberLocations([location])
    searchWeatherList.value = [createWeatherItem(location, weatherResponse.data)]
    rememberApiSearch(location.name)
    searchStatus.value = `현재 위치를 ${location.name}(으)로 확인했습니다.`
  } catch (error) {
    if (requestId !== weatherRequestId) {
      return
    }

    if (error.code === 1) {
      searchError.value = '위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.'
    } else if (error.code === 3) {
      searchError.value = '현재 위치를 확인하는 시간이 초과되었습니다.'
    } else {
      searchError.value = '현재 위치의 날씨를 불러오지 못했습니다.'
    }

    searchStatus.value = '현재 위치 검색을 완료하지 못했습니다.'
  } finally {
    isLocating.value = false
  }
}

const handleRecentSearch = async (query) => {
  handleUpdateQuery(query)
  await handleSubmitSearch()
}

const clearRecentApiSearches = () => {
  recentApiSearches.value = []
}

const handleSelectCard = (cityName) => {
  searchStatus.value = `${cityName} 검색 결과를 선택했습니다.`
}

const handleToggleFavorite = (locationKey) => {
  const location = weatherStore.findLocation(locationKey)

  if (!location) {
    return
  }

  const added = weatherStore.toggleFavorite(location)
  searchStatus.value = added
    ? `${location.name} 즐겨찾기에 추가했습니다.`
    : `${location.name} 즐겨찾기를 해제했습니다.`
}

const handleAddDashboard = (locationKey) => {
  const location = weatherStore.findLocation(locationKey)

  if (!location) {
    return
  }

  weatherStore.addDashboardCity(location)
  searchStatus.value = `${location.name} 대시보드에 추가했습니다.`
}

const handleClickDetail = (locationKey) => {
  router.push({
    name: 'weather-detail',
    params: { cityId: locationKey },
    query: {
      from: 'search',
      q: searchQuery.value.trim() || undefined,
    },
  })
}

// 상세 페이지에서 돌아왔을 때 URL 검색어가 있으면 결과를 다시 불러옴
onMounted(() => {
  if (isApiQueryValid.value) {
    handleSubmitSearch()
  }
})
</script>

<template>
  <div class="search-workspace">
    <BaseDashboardCard
      class="search-control-card"
      eyebrow="Search"
      title="대한민국 도시 찾기"
      description="카카오 지역 검색에서 위치를 선택하면 해당 좌표의 날씨를 조회합니다."
    >
      <SearchBar
        :search-query="searchQuery"
        placeholder="예: 서울"
        status-label="현재 검색어"
        show-submit-button
        submit-label="지역 찾기"
        :submit-disabled="
          isSearching || locationSearch.isSuggesting.value || isLocating || !isApiQueryValid
        "
        suggestions-id="kakao-location-suggestions"
        :suggestions-visible="showLocationSuggestions"
        compact
        @update-query="handleUpdateQuery"
        @submit-search="handleSubmitSearch"
      />

      <p v-if="searchQuery && !isApiQueryValid" class="search-validation">
        완성된 도시명을 두 글자 이상 입력해 주세요.
      </p>

      <LocationSuggestionList
        v-if="showLocationSuggestions"
        list-id="kakao-location-suggestions"
        :suggestions="locationSearch.suggestions.value"
        :is-loading="locationSearch.isSuggesting.value"
        :error-message="locationSearch.errorMessage.value"
        @select="handleSelectLocation"
      />

      <div class="location-search-row">
        <div>
          <strong>현재 위치로 찾기</strong>
          <p>요청할 때만 위치 권한을 사용합니다.</p>
        </div>
        <button
          type="button"
          class="button-secondary"
          :disabled="isLocating || isSearching"
          @click="handleSearchCurrentLocation"
        >
          {{ isLocating ? '위치 확인 중...' : '내 위치' }}
        </button>
      </div>

      <div v-if="recentApiSearches.length > 0" class="recent-searches api-recent-searches">
        <div class="recent-searches-header">
          <strong>최근 검색</strong>
          <button type="button" @click="clearRecentApiSearches">전체 삭제</button>
        </div>

        <div class="recent-search-list">
          <button
            v-for="query in recentApiSearches"
            :key="query"
            type="button"
            class="recent-search-chip"
            @click="handleRecentSearch(query)"
          >
            {{ query }}
          </button>
        </div>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard
      class="search-results-card"
      eyebrow="Results"
      title="검색 결과"
      description="선택한 지역의 현재 날씨를 확인하고 대시보드나 즐겨찾기에 추가할 수 있습니다."
    >
      <template v-if="searchResultSummary.total > 0" #actions>
        <div class="search-result-summary">
          <span>결과 {{ searchResultSummary.total }}</span>
          <span>대시보드 {{ searchResultSummary.dashboard }}</span>
          <span>즐겨찾기 {{ searchResultSummary.favorites }}</span>
        </div>
      </template>

      <p v-if="isSearching" class="detail-state">
        선택한 지역의 현재 날씨를 불러오는 중입니다...
      </p>

      <div v-else-if="searchError" class="detail-state error">
        <p>{{ searchError }}</p>
        <button type="button" class="btn-back" @click="handleSubmitSearch">다시 시도</button>
      </div>

      <template v-else>
        <div v-if="searchWeatherList.length > 0" class="weather-card-grid search-result-grid">
          <WeatherCard
            v-for="item in searchWeatherList"
            :key="item.locationKey"
            :weather="item"
            :favorite="weatherStore.isFavorite(item.locationKey)"
            :in-dashboard="weatherStore.isInDashboard(item.locationKey)"
            show-dashboard-action
            @select-card="handleSelectCard"
            @click-detail="handleClickDetail"
            @toggle-favorite="handleToggleFavorite"
            @add-dashboard="handleAddDashboard"
          />
        </div>

        <p v-if="!hasSearched" class="empty-message">
          왼쪽 검색창에서 지역 후보를 선택해 보세요.
        </p>

        <p v-else-if="searchWeatherList.length === 0" class="empty-message">
          표시할 지역 날씨가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <div class="status-bar" aria-live="polite">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ searchStatus }}
    </div>
  </div>
</template>
