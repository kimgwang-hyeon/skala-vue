<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { weatherMockList } from '@/data/weatherMock.js'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import {
  getFavoriteCityIds,
  getRecentSearches,
  saveFavoriteCityIds,
  saveRecentSearches,
} from '@/utils/weatherStorage.js'

// 현재 URL의 query를 읽을 때 사용
const route = useRoute()

// 다른 경로로 이동하거나 현재 URL의 query를 바꿀 때 사용
const router = useRouter()

// query 값이 문자열일 때만 검색어로 사용
const getQueryText = (queryValue) => {
  return typeof queryValue === 'string' ? queryValue : ''
}

// 상세보기 클릭 시 동적 경로로 이동하고 현재 검색어도 query로 전달
const handleClickDetail = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: {
      cityId,
    },
    query: {
      ...route.query,
      q: searchQuery.value.trim() || undefined,
    },
  })
}

// 0. [1일차 데이터] 현재 상세 정보가 열려 있는 도시의 id

const weatherList = ref([...weatherMockList])

// 2. [1일차 데이터] URL에 q가 있으면 새로고침 후에도 검색어 복원
const searchQuery = ref(getQueryText(route.query.q))

// 최근 검색어와 즐겨찾기 id는 새로고침 후에도 유지
const recentSearches = ref(getRecentSearches())
const favoriteCityIds = ref(getFavoriteCityIds())

// 검색어가 바뀌면 현재 URL을 /?q=검색어 형태로 변경
// replace를 사용하므로 글자마다 브라우저 방문 기록이 쌓이지 않음
watch(searchQuery, (newQuery) => {
  const query = newQuery.trim()

  if (query === getQueryText(route.query.q)) {
    return
  }

  router.replace({
    name: 'home',
    query: {
      ...route.query,
      q: query || undefined,
    },
  })
})

// 주소창 이동이나 뒤로가기로 q가 바뀌면 검색창도 다시 동기화
watch(
  () => route.query.q,
  (newQuery) => {
    const query = getQueryText(newQuery)

    if (searchQuery.value !== query) {
      searchQuery.value = query
    }
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

// 완성형·초성·종성이 섞인 검색어를 비교하는 함수
const matchesMixedQuery = (name, query) => {
  const nameChars = [...name]
  const queryChars = [...query]

  if (queryChars.length > nameChars.length) {
    return false
  }

  return queryChars.every((queryChar, index) => {
    const nameChar = nameChars[index]

    if (CHOSEONG.includes(queryChar)) {
      return getChoseong(nameChar) === queryChar
    }

    const nameParts = getHangulParts(nameChar)
    const queryParts = getHangulParts(queryChar)

    if (!nameParts || !queryParts) {
      return nameChar === queryChar
    }

    // 검색어에 종성이 없으면 이름 쪽 종성은 무시
    return (
      nameParts.initial === queryParts.initial &&
      nameParts.medial === queryParts.medial &&
      (queryParts.final === 0 || nameParts.final === queryParts.final)
    )
  })
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
      return item.name.includes(query) || matchesMixedQuery(item.name, query)
    })
  })
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

const isFavorite = (cityId) => {
  return favoriteCityIds.value.includes(Number(cityId))
}

// 즐겨찾기 id를 추가하거나 제거
const toggleFavorite = (cityId) => {
  const id = Number(cityId)

  favoriteCityIds.value = isFavorite(id)
    ? favoriteCityIds.value.filter((favoriteId) => favoriteId !== id)
    : [...favoriteCityIds.value, id]

  saveFavoriteCityIds(favoriteCityIds.value)
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
const handleToggleFavorite = (cityId) => {
  toggleFavorite(cityId)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 6. 도시 검색 영역: Props로 검색어 전달, Emits로 변경값 수신 -->
    <BaseDashboardCard title="도시 검색">
      <!-- 부모 -> SearchBar: 검색어 Props 전달 -->
      <!-- SearchBar -> 부모: update-query와 submit-search Emit 수신 -->
      <SearchBar
        :search-query="searchQuery"
        @update-query="handleUpdateQuery"
        @submit-search="handleSubmitSearch"
      />

      <div v-if="recentSearches.length > 0" class="recent-searches">
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
    </BaseDashboardCard>

    <!-- 7. 날씨 카드 목록: 부모가 v-for를 처리하고 각 도시 데이터를 Props로 전달 -->
    <BaseDashboardCard title="지역별 날씨 현황">
      <!-- key: 각 카드의 고유 식별자 -->
      <!-- weather: 부모에서 WeatherCard로 도시 데이터 Props 전달 -->
      <!-- select-card, click-detail: WeatherCard의 Emit 수신 -->
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :weather="item"
        :favorite="isFavorite(item.id)"
        @select-card="handleSelectCard"
        @click-detail="handleClickDetail"
        @toggle-favorite="handleToggleFavorite"
      />
      <p v-if="filteredWeatherList.length === 0" class="empty-message">검색 결과가 없습니다.</p>
    </BaseDashboardCard>

    <!-- 8. 선택 또는 검색 상태바 -->
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
