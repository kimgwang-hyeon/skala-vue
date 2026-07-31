<script setup>
import { ref } from 'vue'

// 1. 카드에 출력할 날씨 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

// 2. 검색창 입력값
const searchQuery = ref('')

// 3. 카드 선택 시 상태바에 보여 줄 문구
const selectedCityInfo = ref('카드를 선택해 보세요.')

// 4. 카드를 클릭했을 때 상태바 문구를 바꾸는 함수
const selectCity = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

// 5. 상세보기 버튼 함수
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 6. 도시 검색 영역 -->
    <section class="search-box">
      <h3>도시 검색</h3>
      <input
        v-bind:value="searchQuery"
        @input="(e) => (searchQuery = e.target.value)"
        placeholder="도시를 검색하세요"
      />
      <p>검색 중인 도시: <strong>{{ searchQuery || '입력 대기 중' }}</strong></p>
    </section>

    <!-- 7. 날씨 카드 목록 -->
    <section class="list-box">
      <h3>지역별 날씨 현황</h3>
      <div
        v-for="item in weatherList"
        :key="item.id"
        class="weather-card"
        @click="selectCity(item.name)"
      >
        <h4>{{ item.name }}</h4>
        <p>기온 : {{ item.temp }}°C</p>
        <p>상태 : {{ item.status }}</p>
        <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
        <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
        <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
      </div>
    </section>

    <!-- 8. 선택 상태바 -->
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
