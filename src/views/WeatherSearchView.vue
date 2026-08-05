<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import {
  fetchCurrentWeather,
  reverseGeocodeLocation,
  searchKoreanCities,
} from '@/api/weatherApi.js'
import {
  createLocationFromGeocode,
  useWeatherStore,
} from '@/stores/weatherStore.js'
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
const rawLocationResults = ref([])
const searchWeatherList = ref([])
const isSearching = ref(false)
const isLocating = ref(false)
const hasSearched = ref(false)
const searchError = ref('')
const searchStatus = ref('대한민국의 새로운 도시를 검색해 보세요.')
const recentApiSearches = ref(getApiRecentSearches())

// API 검색은 '서울'처럼 완성된 도시명을 입력했을 때만 허용
const isApiQueryValid = computed(() => {
  const query = searchQuery.value.trim()
  const hasStandaloneJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(query)

  return query.length >= 2 && !hasStandaloneJamo
})

// API 응답 중 대한민국 도시만 남기고 좌표가 같은 결과는 한 번만 사용
const koreanLocations = computed(() => {
  const locationMap = new Map()

  rawLocationResults.value
    .filter((item) => item.country === 'KR')
    .map(createLocationFromGeocode)
    .forEach((location) => {
      locationMap.set(location.key, location)
    })

  return [...locationMap.values()]
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

// API 검색어를 URL query와 동기화하여 새로고침·뒤로가기에도 유지
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
      searchQuery.value = query
    }
  },
)

// API 검색 기록이 바뀐 뒤에만 localStorage에 저장
watch(
  recentApiSearches,
  (newSearches) => {
    saveApiRecentSearches(newSearches)
  },
  { deep: true },
)

const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const rememberApiSearch = (query) => {
  recentApiSearches.value = [
    query,
    ...recentApiSearches.value.filter((item) => item !== query),
  ].slice(0, 5)
}

const handleSubmitSearch = async () => {
  const query = searchQuery.value.trim()

  if (!isApiQueryValid.value) {
    searchStatus.value = 'API 검색은 서울처럼 완성된 도시명을 두 글자 이상 입력해 주세요.'
    return
  }

  isSearching.value = true
  hasSearched.value = true
  searchError.value = ''
  rawLocationResults.value = []
  searchWeatherList.value = []
  searchStatus.value = `${query}의 대한민국 도시 정보를 검색하고 있습니다.`

  try {
    const locationResponse = await searchKoreanCities(query)
    rawLocationResults.value = locationResponse.data

    if (koreanLocations.value.length === 0) {
      searchStatus.value = `${query}에 해당하는 대한민국 도시를 찾지 못했습니다.`
      return
    }

    rememberApiSearch(query)

    // 검색한 위치를 Pinia에 기억하여 상세 라우트를 새로고침해도 좌표를 찾을 수 있게 함
    weatherStore.rememberLocations(koreanLocations.value)

    const weatherResponses = await Promise.allSettled(
      koreanLocations.value.map((location) => fetchCurrentWeather(location.coord)),
    )

    searchWeatherList.value = weatherResponses.flatMap((response, index) => {
      return response.status === 'fulfilled'
        ? [createWeatherItem(koreanLocations.value[index], response.value.data)]
        : []
    })

    const failedCount = weatherResponses.length - searchWeatherList.value.length

    searchStatus.value =
      failedCount > 0
        ? `${searchWeatherList.value.length}개 결과를 표시했습니다. ${failedCount}개 날씨 요청은 실패했습니다.`
        : `${searchWeatherList.value.length}개의 대한민국 검색 결과를 찾았습니다.`
  } catch (error) {
    searchError.value =
      error.response?.status === 401
        ? 'OpenWeather API 키를 확인해 주세요.'
        : '도시 검색 중 오류가 발생했습니다.'
    searchStatus.value = '검색을 완료하지 못했습니다.'
  } finally {
    isSearching.value = false
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
  hasSearched.value = true
  searchError.value = ''
  searchWeatherList.value = []
  searchStatus.value = '현재 위치와 도시명을 확인하고 있습니다.'

  try {
    const coordinates = await getCurrentCoordinates()
    const geocodeResponse = await reverseGeocodeLocation(coordinates)
    const geocode = geocodeResponse.data[0]

    if (!geocode) {
      throw new Error('REVERSE_GEOCODE_EMPTY')
    }

    if (geocode.country !== 'KR') {
      searchStatus.value = '현재 위치가 대한민국 외지역이라 검색 결과에서 제외했습니다.'
      return
    }

    const location = createLocationFromGeocode(geocode)
    const weatherResponse = await fetchCurrentWeather(location.coord)

    weatherStore.rememberLocations([location])
    rawLocationResults.value = [geocode]
    searchWeatherList.value = [createWeatherItem(location, weatherResponse.data)]
    searchQuery.value = location.name
    rememberApiSearch(location.name)
    searchStatus.value = `현재 위치를 ${location.name}(으)로 확인했습니다.`
  } catch (error) {
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

const handleRecentSearch = (query) => {
  searchQuery.value = query
  handleSubmitSearch()
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
      description="완성된 도시명을 입력하면 대한민국 결과만 조회합니다."
    >
      <SearchBar
        :search-query="searchQuery"
        placeholder="예: 서울, 성남, 전주"
        status-label="현재 검색어"
        show-submit-button
        submit-label="도시 검색"
        :submit-disabled="isSearching || !isApiQueryValid"
        compact
        @update-query="handleUpdateQuery"
        @submit-search="handleSubmitSearch"
      />

      <p v-if="searchQuery && !isApiQueryValid" class="search-validation">
        완성된 도시명을 두 글자 이상 입력해 주세요.
      </p>

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
      description="날씨를 확인한 뒤 대시보드나 즐겨찾기에 바로 추가할 수 있습니다."
    >
      <template v-if="searchResultSummary.total > 0" #actions>
        <div class="search-result-summary">
          <span>결과 {{ searchResultSummary.total }}</span>
          <span>대시보드 {{ searchResultSummary.dashboard }}</span>
          <span>즐겨찾기 {{ searchResultSummary.favorites }}</span>
        </div>
      </template>

      <p v-if="isSearching" class="detail-state">
        위치와 현재 날씨를 불러오는 중입니다...
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
          왼쪽 검색창에서 대한민국 도시를 검색해 보세요.
        </p>

        <p v-else-if="searchWeatherList.length === 0" class="empty-message">
          표시할 대한민국 도시 검색 결과가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <div class="status-bar" aria-live="polite">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ searchStatus }}
    </div>
  </div>
</template>
