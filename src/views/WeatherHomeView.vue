<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { fetchCurrentWeather } from '@/api/weatherApi.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { getWeatherDisplay } from '@/utils/weatherDisplay.js'
import { getRecentSearches, saveRecentSearches } from '@/utils/weatherStorage.js'

// 현재 URL의 query를 읽을 때 사용
const route = useRoute()

// 다른 경로로 이동하거나 현재 URL의 query를 바꿀 때 사용
const router = useRouter()

// 대시보드 도시·즐겨찾기를 모든 라우트에서 공유하는 Pinia 스토어
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

// query 값이 문자열일 때만 검색어로 사용
const getQueryText = (queryValue) => {
  return typeof queryValue === 'string' ? queryValue : ''
}

// 상세보기 클릭 시 좌표 기반 locationKey를 동적 경로로 전달
const handleClickDetail = (locationKey) => {
  router.push({
    name: 'weather-detail',
    params: {
      cityId: locationKey,
    },
    query: {
      from: 'home',
      q: searchQuery.value.trim() || undefined,
    },
  })
}

// 대시보드에 등록된 도시의 실제 현재 날씨
const weatherList = ref([])
const isDashboardLoading = ref(false)
const dashboardError = ref('')
const lastUpdatedAt = ref(null)
let dashboardRequestId = 0

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

// 등록된 도시 5개의 날씨를 동시에 요청하고 성공한 결과부터 표시
const loadDashboardWeather = async () => {
  const requestId = ++dashboardRequestId
  const locations = [...weatherStore.dashboardCities]

  if (locations.length === 0) {
    weatherList.value = []
    dashboardError.value = ''
    isDashboardLoading.value = false
    return
  }

  isDashboardLoading.value = true
  dashboardError.value = ''

  const responses = await Promise.allSettled(
    locations.map((location) => fetchCurrentWeather(location.coord)),
  )

  // 더 늦게 끝난 이전 요청이 최신 상태를 덮어쓰지 않도록 방지
  if (requestId !== dashboardRequestId) {
    return
  }

  weatherList.value = responses.flatMap((response, index) => {
    return response.status === 'fulfilled'
      ? [createWeatherItem(locations[index], response.value.data)]
      : []
  })

  const failedCount = responses.length - weatherList.value.length

  if (failedCount > 0) {
    dashboardError.value = `${failedCount}개 도시의 날씨를 불러오지 못했습니다.`
  }

  if (weatherList.value.length > 0) {
    lastUpdatedAt.value = new Date()
  }

  isDashboardLoading.value = false
}

// Pinia의 대시보드 도시 구성이 바뀌면 API 데이터를 다시 요청
watch(
  () => weatherStore.dashboardCities.map((location) => location.key).join('|'),
  loadDashboardWeather,
  { immediate: true },
)

// 2. [1일차 데이터] URL에 q가 있으면 새로고침 후에도 검색어 복원
const searchQuery = ref(getQueryText(route.query.q))

const SORT_OPTIONS = ['default', 'temp-desc', 'temp-asc', 'humidity-desc', 'name']
const getSortOption = (value) => {
  return typeof value === 'string' && SORT_OPTIONS.includes(value) ? value : 'default'
}

// 정렬과 즐겨찾기 보기 상태도 URL query에서 복원
const sortOption = ref(getSortOption(route.query.sort))
const showFavoritesOnly = ref(route.query.favorites === '1')

// 최근 검색어는 새로고침 후에도 유지
const recentSearches = ref(getRecentSearches())

// 검색어·정렬·즐겨찾기 필터를 하나의 query 객체로 만듦
// 세 값을 항상 함께 쓰므로 한쪽 변경이 다른 쪽을 덮어쓰지 않음
const buildHomeQuery = () => {
  return {
    q: searchQuery.value.trim() || undefined,
    sort: sortOption.value === 'default' ? undefined : sortOption.value,
    favorites: showFavoritesOnly.value ? '1' : undefined,
  }
}

const HOME_QUERY_KEYS = ['q', 'sort', 'favorites']

const isSameHomeQuery = (left, right) => {
  return HOME_QUERY_KEYS.every((key) => (left[key] ?? '') === (right[key] ?? ''))
}

let queryUpdateTimerId

// watch 실습: 화면 상태가 바뀌면 URL을 갱신해 새로고침·뒤로가기에도 유지
// 입력을 멈춘 뒤에만 replace를 호출하므로 글자마다 라우팅이 일어나지 않음
// (목록 필터링은 computed가 즉시 처리하므로 화면 반응은 지연되지 않음)
watch([searchQuery, sortOption, showFavoritesOnly], (_newValues, _oldValues, onCleanup) => {
  clearTimeout(queryUpdateTimerId)

  queryUpdateTimerId = window.setTimeout(() => {
    const nextQuery = buildHomeQuery()

    if (isSameHomeQuery(nextQuery, route.query)) {
      return
    }

    router.replace({ name: 'home', query: nextQuery })
  }, 300)

  onCleanup(() => {
    clearTimeout(queryUpdateTimerId)
  })
})

// 주소창 입력이나 브라우저 뒤로가기로 query가 바뀌면 화면 상태를 되돌림
watch(
  () => [route.query.q, route.query.sort, route.query.favorites],
  ([newQuery, newSort, newFavorites]) => {
    const query = getQueryText(newQuery)

    if (searchQuery.value !== query) {
      searchQuery.value = query
    }

    sortOption.value = getSortOption(newSort)
    showFavoritesOnly.value = newFavorites === '1'
  },
)

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

const JUNGSEONG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
]

const JONGSEONG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

// 한글 이름을 초성으로 변환하는 함수
const getChoseong = (text) => {
  return [...text]
    .map((char) => {
      const code = char.charCodeAt(0)

      if (code < 0xac00 || code > 0xd7a3) {
        return char
      }

      return CHOSEONG[Math.floor((code - 0xac00) / 588)]
    })
    .join('')
}

// 한글 한 글자의 초성·중성·종성을 분리
const getHangulParts = (char) => {
  const code = char.charCodeAt(0)

  if (code < 0xac00 || code > 0xd7a3) {
    return null
  }

  const index = code - 0xac00

  return {
    initial: Math.floor(index / 588),
    medial: Math.floor((index % 588) / 28),
    final: index % 28,
  }
}

// 완성형 한글을 검색용 전체 자모 문자열로 변환
// 예: '서울' -> 'ㅅㅓㅇㅜㄹ'
const decomposeHangul = (text) => {
  return [...text]
    .map((char) => {
      const parts = getHangulParts(char)

      if (!parts) {
        return char
      }

      return (
        CHOSEONG[parts.initial] + JUNGSEONG[parts.medial] + JONGSEONG[parts.final]
      )
    })
    .join('')
}

// 초성 검색과 전체 자모 검색을 구분하여 도시명 앞부분을 비교
const matchesCityName = (name, query) => {
  const normalizedName = name.trim().toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()
  const isChoseongQuery = [...normalizedQuery].every((char) => CHOSEONG.includes(char))

  if (isChoseongQuery) {
    return getChoseong(normalizedName).startsWith(normalizedQuery)
  }

  return decomposeHangul(normalizedName).startsWith(decomposeHangul(normalizedQuery))
}

// 쉼표를 기준으로 여러 검색어를 분리
const splitSearchQueries = (query) => {
  return query
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// 2-1. [2일차 데이터] 검색어를 입력하면 날씨 카드 목록을 필터링하는 computed
const filteredWeatherList = computed(() => {
  const queries = splitSearchQueries(searchQuery.value)

  if (queries.length === 0) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => {
    return queries.some((query) => {
      return matchesCityName(item.name, query)
    })
  })
})

// 검색 결과에 즐겨찾기 필터와 사용자가 고른 정렬 방식을 차례대로 적용
const displayWeatherList = computed(() => {
  const list = showFavoritesOnly.value
    ? filteredWeatherList.value.filter((item) => weatherStore.isFavorite(item.locationKey))
    : [...filteredWeatherList.value]

  if (sortOption.value === 'temp-desc') {
    return list.sort((first, second) => second.main.temp - first.main.temp)
  }

  if (sortOption.value === 'temp-asc') {
    return list.sort((first, second) => first.main.temp - second.main.temp)
  }

  if (sortOption.value === 'humidity-desc') {
    return list.sort((first, second) => second.main.humidity - first.main.humidity)
  }

  if (sortOption.value === 'name') {
    return list.sort((first, second) => first.name.localeCompare(second.name, 'ko'))
  }

  return list
})

// computed 실습: 현재 대시보드의 평균 기온과 가장 더운 도시 계산
const dashboardSummary = computed(() => {
  if (weatherList.value.length === 0) {
    return null
  }

  const totalTemperature = weatherList.value.reduce((sum, item) => {
    return sum + item.main.temp
  }, 0)

  const hottestCity = weatherList.value.reduce((hottest, item) => {
    return item.main.temp > hottest.main.temp ? item : hottest
  })

  return {
    averageTemperature: configStore.convertTemperature(
      totalTemperature / weatherList.value.length,
    ),
    hottestCityName: hottestCity.name,
    hottestTemperature: configStore.convertTemperature(hottestCity.main.temp),
  }
})

const featuredWeather = computed(() => {
  return weatherList.value[0] ?? null
})

const featuredWeatherDisplay = computed(() => {
  return featuredWeather.value
    ? getWeatherDisplay(featuredWeather.value.weather[0])
    : null
})

const currentDateLabel = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

const lastUpdatedLabel = computed(() => {
  if (!lastUpdatedAt.value) {
    return '업데이트 대기 중'
  }

  return `${new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedAt.value)} 업데이트`
})

// 2-2. [2일차 데이터] watchEffect를 사용하여 검색어가 바뀔 때마다 콘솔에 출력
watchEffect(() => {
  console.log(`👁️‍🗨️ [watchEffect 자동 호출]
  현재 검색어 "${searchQuery.value}"에 매칭되는 API 데이터를 필터링 합니다.`)
})

// 3. [1일차 데이터] 카드 선택 시 상태바에 보여 줄 문구
const selectedCityInfo = ref('카드를 선택해 보세요.')

// 3-1. [2일차 데이터] 상태바 문구가 변경될 때 새 문구를 콘솔에 출력하는 watch
watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

// 4. [1일차 데이터] 카드를 클릭했을 때 상태바 문구를 바꾸는 함수
const selectCity = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

// Enter로 검색한 문구를 최근 검색 목록 맨 앞에 저장
const addRecentSearch = () => {
  const query = searchQuery.value.trim()

  if (!query) {
    return
  }

  recentSearches.value = [query, ...recentSearches.value.filter((item) => item !== query)].slice(
    0,
    5,
  )

  saveRecentSearches(recentSearches.value)
}

// 최근 검색어 버튼을 누르면 검색창에 다시 적용
const applyRecentSearch = (query) => {
  searchQuery.value = query
  selectedCityInfo.value = `${query} 검색을 실행했습니다.`
}

const clearRecentSearches = () => {
  recentSearches.value = []
  saveRecentSearches([])
}

const isFavorite = (locationKey) => {
  return weatherStore.isFavorite(locationKey)
}

// 좌표 기반 도시 객체를 Pinia 즐겨찾기에 추가하거나 제거
const toggleFavorite = (locationKey) => {
  const location = weatherStore.findLocation(locationKey)

  if (!location) {
    return
  }

  const added = weatherStore.toggleFavorite(location)
  selectedCityInfo.value = added
    ? `${location.name} 즐겨찾기에 추가했습니다.`
    : `${location.name} 즐겨찾기를 해제했습니다.`
}

// SearchBar가 보낸 검색어 변경 Emit을 처리하는 부모 함수
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// 5. [1일차 데이터] 검색어를 입력하고 Enter를 눌렀을 때 실행할 함수
const submitSearch = () => {
  addRecentSearch()
  selectedCityInfo.value = searchQuery.value
    ? `${searchQuery.value} 검색을 실행했습니다.`
    : '검색어를 입력해 주세요.'
}

// SearchBar가 Enter 입력으로 보낸 검색 실행 Emit을 처리하는 부모 함수
const handleSubmitSearch = () => {
  submitSearch()
}

// WeatherCard가 보낸 카드 선택 Emit을 처리하는 부모 함수
const handleSelectCard = (cityName) => {
  selectCity(cityName)
}

// WeatherCard가 보낸 즐겨찾기 Emit을 처리하는 부모 함수
const handleToggleFavorite = (locationKey) => {
  toggleFavorite(locationKey)
}

const handleRemoveDashboard = (locationKey) => {
  const location = weatherStore.findLocation(locationKey)
  weatherStore.removeDashboardCity(locationKey)
  selectedCityInfo.value = `${location?.name ?? '도시'} 대시보드에서 삭제했습니다.`
}

const handleResetDashboard = () => {
  weatherStore.resetDashboardCities()
  selectedCityInfo.value = '기본 도시 5개를 복원했습니다.'
}

const handleRefreshDashboard = () => {
  loadDashboardWeather()
  selectedCityInfo.value = '대시보드 날씨를 새로고침했습니다.'
}
</script>

<template>
  <div class="dashboard-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Weather / Overview</p>
        <h1>오늘의 날씨</h1>
        <p class="page-description">{{ currentDateLabel }} · {{ lastUpdatedLabel }}</p>
      </div>

      <RouterLink class="button-primary" :to="{ name: 'search' }">
        <span aria-hidden="true">＋</span>
        도시 추가
      </RouterLink>
    </header>

    <div class="status-bar" aria-live="polite">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ selectedCityInfo }}
    </div>

    <section v-if="featuredWeather && featuredWeatherDisplay" class="dashboard-hero-grid">
      <article
        class="featured-weather-panel"
        :class="`weather-tone-${featuredWeatherDisplay.tone}`"
      >
        <div class="featured-weather-copy">
          <p>대표 도시 · {{ featuredWeather.state }}</p>
          <h2>{{ featuredWeather.name }}</h2>
          <span>{{ featuredWeatherDisplay.label }}</span>
        </div>

        <div class="featured-weather-current">
          <span aria-hidden="true">{{ featuredWeatherDisplay.emoji }}</span>
          <strong>
            {{ configStore.convertTemperature(featuredWeather.main.temp) }}°
          </strong>
          <small>{{ configStore.unit === 'celsius' ? 'C' : 'F' }}</small>
        </div>

        <dl class="featured-weather-metrics">
          <div>
            <dt>체감</dt>
            <dd>
              {{ configStore.convertTemperature(featuredWeather.main.feels_like) }}°
            </dd>
          </div>
          <div>
            <dt>습도</dt>
            <dd>{{ featuredWeather.main.humidity }}%</dd>
          </div>
          <div>
            <dt>풍속</dt>
            <dd>{{ featuredWeather.wind?.speed ?? 0 }}m/s</dd>
          </div>
        </dl>

        <button
          type="button"
          class="featured-detail-button"
          @click="handleClickDetail(featuredWeather.locationKey)"
        >
          상세 날씨
          <span aria-hidden="true">→</span>
        </button>
      </article>

      <article v-if="dashboardSummary" class="dashboard-overview-panel">
        <header>
          <div>
            <p>Overview</p>
            <h2>한눈에 보기</h2>
          </div>
          <span>Live</span>
        </header>

        <dl class="overview-stat-grid">
          <div>
            <dt>등록 도시</dt>
            <dd>{{ weatherStore.dashboardCities.length }}</dd>
          </div>
          <div>
            <dt>평균 기온</dt>
            <dd>{{ dashboardSummary.averageTemperature }}°</dd>
          </div>
          <div>
            <dt>가장 더운 도시</dt>
            <dd>{{ dashboardSummary.hottestCityName }}</dd>
          </div>
          <div>
            <dt>즐겨찾기</dt>
            <dd>{{ weatherStore.favoriteCities.length }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <p v-if="dashboardError" class="inline-alert">{{ dashboardError }}</p>
    <p v-if="isDashboardLoading && weatherList.length === 0" class="detail-state">
      대시보드 날씨를 불러오는 중입니다...
    </p>

    <BaseDashboardCard
      eyebrow="Cities"
      title="내 도시"
      description="등록한 도시의 현재 날씨를 검색하고 정렬할 수 있습니다."
    >
      <template #actions>
        <button type="button" class="button-secondary" @click="handleRefreshDashboard">
          새로고침
        </button>
        <button type="button" class="button-secondary" @click="handleResetDashboard">
          기본 도시 복원
        </button>
      </template>

      <div class="dashboard-filter-panel">
        <SearchBar
          :search-query="searchQuery"
          placeholder="초성·자모 또는 쉼표로 내 도시 검색"
          status-label="내 도시 검색어"
          compact
          :show-status="false"
          @update-query="handleUpdateQuery"
          @submit-search="handleSubmitSearch"
        />

        <label class="dashboard-sort-control">
          <span>정렬</span>
          <select v-model="sortOption" aria-label="카드 정렬">
            <option value="default">등록순</option>
            <option value="temp-desc">기온 높은 순</option>
            <option value="temp-asc">기온 낮은 순</option>
            <option value="humidity-desc">습도 높은 순</option>
            <option value="name">도시 이름순</option>
          </select>
        </label>

        <label class="dashboard-favorite-filter">
          <input v-model="showFavoritesOnly" type="checkbox" />
          <span>즐겨찾기만</span>
        </label>
      </div>

      <div v-if="recentSearches.length > 0" class="recent-searches dashboard-recent-searches">
        <div class="recent-searches-header">
          <strong>최근 검색</strong>
          <button type="button" @click="clearRecentSearches">전체 삭제</button>
        </div>

        <div class="recent-search-list">
          <button
            v-for="query in recentSearches"
            :key="query"
            type="button"
            class="recent-search-chip"
            @click="applyRecentSearch(query)"
          >
            {{ query }}
          </button>
        </div>
      </div>

      <div class="city-list-heading">
        <p>
          <strong>{{ displayWeatherList.length }}</strong>
          / {{ weatherStore.dashboardCities.length }}개 도시 표시
        </p>
        <RouterLink :to="{ name: 'search' }">새 도시 검색 →</RouterLink>
      </div>

      <div v-if="displayWeatherList.length > 0" class="weather-card-grid">
        <WeatherCard
          v-for="item in displayWeatherList"
          :key="item.locationKey"
          :weather="item"
          :favorite="isFavorite(item.locationKey)"
          removable
          @select-card="handleSelectCard"
          @click-detail="handleClickDetail"
          @toggle-favorite="handleToggleFavorite"
          @remove-dashboard="handleRemoveDashboard"
        />
      </div>

      <p
        v-if="
          !isDashboardLoading &&
          weatherStore.dashboardCities.length > 0 &&
          displayWeatherList.length === 0
        "
        class="empty-message"
      >
        {{
          showFavoritesOnly
            ? '조건에 맞는 즐겨찾기 도시가 없습니다.'
            : '내 대시보드에서 일치하는 도시를 찾지 못했습니다.'
        }}
      </p>

      <div
        v-if="!isDashboardLoading && weatherStore.dashboardCities.length === 0"
        class="empty-message"
      >
        <p>대시보드에 등록된 도시가 없습니다.</p>
        <RouterLink class="button-primary" :to="{ name: 'search' }">
          대한민국 도시 검색에서 추가하기
        </RouterLink>
      </div>
    </BaseDashboardCard>
  </div>
</template>
