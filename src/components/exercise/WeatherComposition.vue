<script setup>
import { ref, computed } from 'vue'

// 0. [1일차 데이터] 현재 상세 정보가 열려 있는 도시의 id
const openCityId = ref(null)

// 1. [1일차 데이터] 카드에 출력할 날씨 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 30, status: '맑음', humidity: 60 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80 },
  { id: 'city_03', name: '부산', temp: 16, status: '구름', humidity: 70 },
])

// 2. [1일차 데이터] 검색창 입력값
const searchQuery = ref('')

// 2-1. [2일차 데이터] 검색어를 입력하면 날씨 카드 목록을 필터링하는 computed
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(query))
})

// 3. [1일차 데이터] 카드 선택 시 상태바에 보여 줄 문구
const selectedCityInfo = ref('카드를 선택해 보세요.')

// 4. [1일차 데이터] 카드를 클릭했을 때 상태바 문구를 바꾸는 함수
const selectCity = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

// 5. [1일차 데이터] 검색어를 입력하고 Enter를 눌렀을 때 실행할 함수
const submitSearch = () => {
  selectedCityInfo.value = searchQuery.value
    ? `${searchQuery.value} 검색을 실행했습니다.`
    : '검색어를 입력해 주세요.'
}

// 6. [1일차 데이터] 상세보기 영역을 열고 닫는 함수
const toggleDetail = (cityId) => {
  openCityId.value = openCityId.value === cityId ? null : cityId
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 6. 도시 검색 영역: 현재는 v-model 방식으로 입력값 연결 -->
    <section class="search-box">
      <h3>도시 검색</h3>
      <input
        :value="searchQuery"
        @input="searchQuery = $event.target.value"
        @keyup.enter="submitSearch"
        placeholder="도시를 검색하세요"
      />
      <p>
        검색 중인 도시: <strong>{{ searchQuery || '입력 대기 중' }}</strong>
      </p>
    </section>

    <!-- 7. 날씨 카드 목록과 온도별 상태 표시 -->
    <section class="list-box">
      <h3>지역별 날씨 현황</h3>
      <div
        v-for="item in filteredWeatherList"
        :key="item.id"
        class="weather-card"
        @click="selectCity(item.name)"
      >
        <h4>{{ item.name }}</h4>
        <p>기온 : {{ item.temp }}°C</p>
        <p>상태 : {{ item.status }}</p>
        <span
          class="badge"
          :class="{
            hot: item.temp >= 30,
            warm: item.temp >= 20 && item.temp < 30,
            cool: item.temp < 20,
          }"
        >
          <span v-if="item.temp >= 30">🔥 무지 더움</span>
          <span v-else-if="item.temp >= 20">☀️ 포근함</span>
          <span v-else>❄️ 서늘함</span>
        </span>
        <button class="btn-detail" @click.stop="toggleDetail(item.id)">
          {{ openCityId === item.id ? '닫기' : '상세보기' }}
        </button>
        <div v-show="openCityId === item.id" class="detail-box">습도: {{ item.humidity }}%</div>
      </div>
      <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
    </section>

    <!-- 8. 선택 또는 검색 상태바 -->
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
