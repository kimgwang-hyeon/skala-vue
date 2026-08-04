<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { weatherMockList } from '@/data/weatherMock.js'
import { useConfigStore } from '@/stores/configStore.js'
import { fetchCurrentWeather } from '@/api/weatherApi.js'

// 현재 URL 정보를 읽는 객체
const route = useRoute()

const isLoading = ref(false)
const errorMessage = ref('')

// 다른 주소로 이동할 때 사용하는 객체
const router = useRouter()

// URL의 cityId에 해당하는 도시를 담을 변수
const selectedCity = ref(null)

const configStore = useConfigStore()

// URL의 cityId에 해당하는 Mock Data의 도시를 찾는 함수
const findCity = (cityId) => {
  return weatherMockList.find((item) => {
    return String(item.id) === String(cityId)
  })
}

// 도시 좌표를 기준으로 OpenWeather 현재 날씨를 요청
const loadWeather = async (cityId) => {
  const city = findCity(cityId)

  // URL의 cityId에 해당하는 도시가 없으면 NotFound로 이동
  if (!city) {
    router.replace({
      name: 'not-found',
      params: { pathMatch: ['not-found'] },
    })

    return
  }

  isLoading.value = true
  errorMessage.value = ''
  selectedCity.value = null

  try {
    const response = await fetchCurrentWeather(city.coord)
    selectedCity.value = response.data
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = 'OpenWeather API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else {
      errorMessage.value = '날씨 정보를 불러오지 못했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 상세 페이지가 처음 화면에 나타날 때 API 요청
onMounted(() => {
  loadWeather(route.params.cityId)
})

// 같은 상세 컴포넌트에서 cityId만 바뀌면 API를 다시 요청
watch(
  () => route.params.cityId,
  (newCityId, oldCityId) => {
    if (newCityId && newCityId !== oldCityId) {
      loadWeather(newCityId)
    }
  },
)

// 현재 도시가 Mock Data에서 몇 번째인지 계산
const selectedCityIndex = computed(() => {
  return weatherMockList.findIndex((item) => {
    return String(item.id) === String(route.params.cityId)
  })
})

// 이전 도시와 다음 도시를 computed로 계산
const previousCity = computed(() => {
  return selectedCityIndex.value > 0 ? weatherMockList[selectedCityIndex.value - 1] : null
})

const nextCity = computed(() => {
  const nextIndex = selectedCityIndex.value + 1

  return nextIndex > 0 && nextIndex < weatherMockList.length ? weatherMockList[nextIndex] : null
})

// 이전·다음 도시 버튼 클릭 시 같은 동적 라우트의 cityId만 변경
const handleMoveCity = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: { cityId },
    query: { ...route.query },
  })
}

// 검색 query를 유지한 상태로 메인 페이지로 돌아가기
const handleGoHome = () => {
  router.push({
    name: 'home',
    query: { ...route.query },
  })
}

// API 응답의 섭씨 값을 Pinia에서 선택한 단위로 변환
const displayTemperature = computed(() => {
  return selectedCity.value ? configStore.convertTemperature(selectedCity.value.main.temp) : ''
})

const displayFeelsLike = computed(() => {
  return selectedCity.value
    ? configStore.convertTemperature(selectedCity.value.main.feels_like)
    : ''
})

const displayTempMin = computed(() => {
  return selectedCity.value
    ? configStore.convertTemperature(selectedCity.value.main.temp_min)
    : ''
})

const displayTempMax = computed(() => {
  return selectedCity.value
    ? configStore.convertTemperature(selectedCity.value.main.temp_max)
    : ''
})

const retryWeather = () => {
  loadWeather(route.params.cityId)
}
</script>

<template>
  <BaseDashboardCard title="지역별 상세 기상 관측 정보">
    <div v-if="isLoading" class="detail-state">날씨 정보를 불러오는 중입니다...</div>

    <div v-else-if="errorMessage" class="detail-state error">
      <p>{{ errorMessage }}</p>
      <button type="button" class="btn-back" @click="retryWeather">다시 시도</button>
    </div>

    <div v-else-if="selectedCity" class="detail-box">
      <div class="detail-header">
        <img
          class="weather-icon"
          :src="`https://openweathermap.org/img/wn/${selectedCity.weather[0].icon}@2x.png`"
          :alt="selectedCity.weather[0].description"
        />

        <div>
          <p class="detail-title">{{ selectedCity.name }} 상세 날씨</p>

          <p class="detail-description">
            {{ selectedCity.weather[0].description }}
          </p>
        </div>
      </div>

      <div class="detail-grid">
        <p>
          <span>현재 기온</span>
          <strong>{{ displayTemperature }}{{ configStore.unitSymbol }}</strong>
        </p>

        <p>
          <span>체감온도</span>
          <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong>
        </p>

        <p>
          <span>최저/최고</span>
          <strong>
            {{ displayTempMin }}{{ configStore.unitSymbol }} /
            {{ displayTempMax }}{{ configStore.unitSymbol }}
          </strong>
        </p>

        <p>
          <span>습도</span>
          <strong>{{ selectedCity.main.humidity }}%</strong>
        </p>

        <p>
          <span>기압</span>
          <strong>{{ selectedCity.main.pressure }}hPa</strong>
        </p>

        <p>
          <span>풍속</span>
          <strong>{{ selectedCity.wind.speed }}m/s</strong>
        </p>

        <p>
          <span>풍향</span>
          <strong>{{ selectedCity.wind.deg }}°</strong>
        </p>

        <p>
          <span>구름량</span>
          <strong>{{ selectedCity.clouds.all }}%</strong>
        </p>

        <p>
          <span>가시거리</span>
          <strong>{{ selectedCity.visibility / 1000 }}km</strong>
        </p>
      </div>

      <div v-if="selectedCity.rain || selectedCity.snow" class="detail-extra">
        <p v-if="selectedCity.rain">
          🌧️ 최근 1시간 강수량:
          {{ selectedCity.rain['1h'] }}mm
        </p>

        <p v-if="selectedCity.snow">
          ❄️ 최근 1시간 적설량:
          {{ selectedCity.snow['1h'] }}mm
        </p>
      </div>

      <p class="detail-coordinates">
        위치 좌표:
        {{ selectedCity.coord.lat }},
        {{ selectedCity.coord.lon }}
      </p>

      <!-- 동적 cityId 변경 연습: 같은 컴포넌트 안에서 이전·다음 도시로 이동 -->
      <div class="detail-route-actions">
        <button v-if="previousCity" class="btn-city-nav" @click="handleMoveCity(previousCity.id)">
          ← {{ previousCity.name }}
        </button>

        <button v-if="nextCity" class="btn-city-nav next" @click="handleMoveCity(nextCity.id)">
          {{ nextCity.name }} →
        </button>
      </div>

      <button class="btn-back" @click="handleGoHome">← 메인 대시보드로 돌아가기</button>
    </div>
  </BaseDashboardCard>
</template>
