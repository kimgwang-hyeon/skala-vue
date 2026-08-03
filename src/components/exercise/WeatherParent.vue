<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

// 0. [1일차 데이터] 현재 상세 정보가 열려 있는 도시의 id
const openCityId = ref(null)

// 1. [1일차 데이터] OpenWeather Current Weather API 2.5 응답을 연습하기 위한 데이터
const weatherList = ref([
  {
    id: 1835848,
    name: '서울',
    coord: { lon: 126.978, lat: 37.5665 },
    weather: [{ id: 800, main: 'Clear', description: '맑음', icon: '01d' }],
    main: {
      temp: 30,
      feels_like: 32,
      temp_min: 28,
      temp_max: 33,
      pressure: 1012,
      humidity: 60,
    },
    visibility: 10000,
    wind: { speed: 2.4, deg: 180 },
    clouds: { all: 10 },
    sys: { country: 'KR' },
    // 다음 단계에서 템플릿을 API 구조에 맞추면 제거할 임시 호환 필드
    temp: 30,
    status: '맑음',
    humidity: 60,
  },
  {
    id: 1835553,
    name: '수원',
    coord: { lon: 127.0286, lat: 37.2636 },
    weather: [{ id: 501, main: 'Rain', description: '약한 비', icon: '10d' }],
    main: {
      temp: 24,
      feels_like: 25,
      temp_min: 22,
      temp_max: 26,
      pressure: 1008,
      humidity: 80,
    },
    visibility: 7000,
    wind: { speed: 3.1, deg: 210 },
    clouds: { all: 90 },
    rain: { '1h': 3.2 },
    sys: { country: 'KR' },
    temp: 24,
    status: '비',
    humidity: 80,
  },
  {
    id: 1838524,
    name: '부산',
    coord: { lon: 129.0756, lat: 35.1796 },
    weather: [{ id: 803, main: 'Clouds', description: '구름 많음', icon: '04d' }],
    main: {
      temp: 16,
      feels_like: 15,
      temp_min: 14,
      temp_max: 18,
      pressure: 1015,
      humidity: 70,
    },
    visibility: 10000,
    wind: { speed: 1.8, deg: 90 },
    clouds: { all: 75 },
    sys: { country: 'KR' },
    temp: 16,
    status: '구름',
    humidity: 70,
  },
  {
    id: 1846266,
    name: '제주',
    coord: { lon: 126.5312, lat: 33.4996 },
    weather: [{ id: 601, main: 'Snow', description: '눈', icon: '13d' }],
    main: {
      temp: 2,
      feels_like: -1,
      temp_min: 0,
      temp_max: 4,
      pressure: 1005,
      humidity: 85,
    },
    visibility: 5000,
    wind: { speed: 5.6, deg: 300 },
    clouds: { all: 100 },
    snow: { '1h': 1.4 },
    sys: { country: 'KR' },
    temp: 2,
    status: '눈',
    humidity: 85,
  },
])

// 2. [1일차 데이터] 검색창 입력값
const searchQuery = ref('')

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

// 완성형 한글과 초성이 섞인 검색어를 비교하는 함수
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

    return nameChar === queryChar
  })
}

// 2-1. [2일차 데이터] 검색어를 입력하면 날씨 카드 목록을 필터링하는 computed
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => {
    return item.name.includes(query) || matchesMixedQuery(item.name, query)
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

// SearchBar가 보낸 검색어 변경 Emit을 처리하는 부모 함수
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// 5. [1일차 데이터] 검색어를 입력하고 Enter를 눌렀을 때 실행할 함수
const submitSearch = () => {
  selectedCityInfo.value = searchQuery.value
    ? `${searchQuery.value} 검색을 실행했습니다.`
    : '검색어를 입력해 주세요.'
}

// SearchBar가 Enter 입력으로 보낸 검색 실행 Emit을 처리하는 부모 함수
const handleSubmitSearch = () => {
  submitSearch()
}

// 6. [1일차 데이터] 상세보기 영역을 열고 닫는 함수
const toggleDetail = (cityId) => {
  openCityId.value = openCityId.value === cityId ? null : cityId
}

// WeatherCard가 보낸 카드 선택 Emit을 처리하는 부모 함수
const handleSelectCard = (cityName) => {
  selectCity(cityName)
}

// WeatherCard가 보낸 상세보기 Emit을 처리하는 부모 함수
const handleClickDetail = (cityId) => {
  toggleDetail(cityId)
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
    </BaseDashboardCard>

    <!-- 7. 날씨 카드 목록: 부모가 v-for를 처리하고 각 도시 데이터를 Props로 전달 -->
    <BaseDashboardCard title="지역별 날씨 현황">
      <!-- key: 각 카드의 고유 식별자 -->
      <!-- weather, isOpen: 부모 -> WeatherCard Props 전달 -->
      <!-- select-card, click-detail: WeatherCard -> 부모 Emit 수신 -->
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :weather="item"
        :is-open="openCityId === item.id"
        @select-card="handleSelectCard"
        @click-detail="handleClickDetail"
      />
      <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
    </BaseDashboardCard>

    <!-- 8. 선택 또는 검색 상태바 -->
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
