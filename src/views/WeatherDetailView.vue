<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { fetchCurrentWeather, fetchForecast } from '@/api/weatherApi.js'
import { getWeatherDisplay } from '@/utils/weatherDisplay.js'
import { getWeatherWarnings } from '@/utils/weatherWarnings.js'

// 현재 URL 정보를 읽는 객체
const route = useRoute()

const isLoading = ref(false)
const errorMessage = ref('')

// 도시를 빠르게 옮길 때 먼저 보낸 요청이 늦게 도착해 화면을 덮어쓰지 않도록 요청 순번을 기록
let weatherRequestId = 0

// 3시간 간격 예보와 사용자가 선택한 예보의 순서
const forecastList = ref([])
const selectedForecastIndex = ref(0)
const forecastTimezone = ref(0)
const forecastStatus = ref('')

// 다른 주소로 이동할 때 사용하는 객체
const router = useRouter()

// URL의 cityId에 해당하는 도시를 담을 변수
const selectedCity = ref(null)
const selectedLocation = ref(null)

const configStore = useConfigStore()
const weatherStore = useWeatherStore()

// URL의 식별자에 해당하는 기본·검색·즐겨찾기 도시를 Pinia에서 찾음
const findCity = (cityId) => {
  return weatherStore.findLocation(cityId)
}

// 도시 좌표를 기준으로 OpenWeather 현재 날씨를 요청
const loadWeather = async (cityId) => {
  const requestId = ++weatherRequestId
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
  selectedLocation.value = city
  forecastList.value = []
  selectedForecastIndex.value = 0

  try {
    // 서로 의존하지 않는 두 요청을 동시에 실행
    const [currentResponse, forecastResponse] = await Promise.all([
      fetchCurrentWeather(city.coord),
      fetchForecast(city.coord),
    ])

    // 그 사이 다른 도시로 이동했다면 낡은 응답이므로 폐기
    if (requestId !== weatherRequestId) {
      return
    }

    selectedCity.value = currentResponse.data

    // 5일 요약과 24시간 예보 둘 다에 쓰기 위해 40개 전체를 저장
    forecastList.value = forecastResponse.data.list
    forecastTimezone.value = forecastResponse.data.city.timezone
  } catch (error) {
    if (requestId !== weatherRequestId) {
      return
    }

    if (error.response?.status === 401) {
      errorMessage.value = 'OpenWeather API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else {
      errorMessage.value = '날씨 정보를 불러오지 못했습니다.'
    }
  } finally {
    // 최신 요청만 로딩 상태를 해제해야 진행 중인 요청이 끝난 것처럼 보이지 않음
    if (requestId === weatherRequestId) {
      isLoading.value = false
    }
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

// 현재 도시가 대시보드에서 몇 번째인지 계산
const selectedCityIndex = computed(() => {
  return weatherStore.dashboardCities.findIndex((item) => {
    return item.key === selectedLocation.value?.key
  })
})

// 대시보드에서 들어온 경우 이전 도시와 다음 도시를 computed로 계산
const previousCity = computed(() => {
  return selectedCityIndex.value > 0
    ? weatherStore.dashboardCities[selectedCityIndex.value - 1]
    : null
})

const nextCity = computed(() => {
  const nextIndex = selectedCityIndex.value + 1

  return nextIndex > 0 && nextIndex < weatherStore.dashboardCities.length
    ? weatherStore.dashboardCities[nextIndex]
    : null
})

const showDashboardNavigation = computed(() => {
  return route.query.from !== 'search' && route.query.from !== 'favorites'
})

// 이전·다음 도시 버튼 클릭 시 같은 동적 라우트의 cityId만 변경
const handleMoveCity = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: { cityId },
    query: { ...route.query },
  })
}

// 어떤 라우트에서 상세 페이지로 왔는지에 따라 돌아갈 페이지 계산
const returnRoute = computed(() => {
  if (route.query.from === 'search') {
    return {
      name: 'search',
      query: { q: route.query.q || undefined },
    }
  }

  if (route.query.from === 'favorites') {
    return { name: 'favorites' }
  }

  if (route.query.from === 'map') {
    return { name: 'weather-map' }
  }

  if (route.query.from === 'compare') {
    return {
      name: 'weather-compare',
      query: {
        left: route.query.left || undefined,
        right: route.query.right || undefined,
      },
    }
  }

  return {
    name: 'home',
    query: { q: route.query.q || undefined },
  }
})

const returnButtonLabel = computed(() => {
  if (route.query.from === 'search') {
    return '← 대한민국 도시 검색 결과로 돌아가기'
  }

  if (route.query.from === 'favorites') {
    return '← 즐겨찾기로 돌아가기'
  }

  if (route.query.from === 'map') {
    return '← 날씨 지도로 돌아가기'
  }

  if (route.query.from === 'compare') {
    return '← 도시 비교로 돌아가기'
  }

  return '← 메인 대시보드로 돌아가기'
})

const handleGoBack = () => {
  router.push(returnRoute.value)
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

const currentWeatherDisplay = computed(() => {
  return selectedCity.value ? getWeatherDisplay(selectedCity.value.weather[0]) : null
})

// 3시간 간격 8개만 골라서 앞으로 약 24시간 예보에 사용
const hourlyForecastList = computed(() => {
  return forecastList.value.slice(0, 8)
})

// 선택한 순서가 바뀌면 해당 시간대의 예보 객체도 자동으로 다시 계산
const selectedForecast = computed(() => {
  return hourlyForecastList.value[selectedForecastIndex.value] ?? null
})

// 도시의 timezone 값을 반영하여 예보 시각 표시
const formatForecastTime = (timestamp) => {
  const cityTime = new Date((timestamp + forecastTimezone.value) * 1000)

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(cityTime)
}

// 8개 예보의 최고 기온과 가장 높은 강수 확률을 한 번에 계산
const forecastSummary = computed(() => {
  if (hourlyForecastList.value.length === 0) {
    return null
  }

  const highestTemperature = Math.max(
    ...hourlyForecastList.value.map((item) => item.main.temp),
  )
  const highestRainChance = Math.max(...hourlyForecastList.value.map((item) => item.pop))

  return {
    highestTemperature: configStore.convertTemperature(highestTemperature),
    highestRainChance: Math.round(highestRainChance * 100),
  }
})

// 선택한 예보를 화면에 쓰기 편한 값으로 가공
const selectedForecastInfo = computed(() => {
  if (!selectedForecast.value) {
    return null
  }

  return {
    temperature: configStore.convertTemperature(selectedForecast.value.main.temp),
    feelsLike: configStore.convertTemperature(selectedForecast.value.main.feels_like),
    rainChance: Math.round(selectedForecast.value.pop * 100),
  }
})

const selectedForecastWeatherDisplay = computed(() => {
  return selectedForecast.value
    ? getWeatherDisplay(selectedForecast.value.weather[0])
    : null
})

// 40개의 3시간 예보를 도시 현지 날짜별로 묶어 5일 요약을 만듦
const dailyForecastList = computed(() => {
  const dailyGroups = new Map()

  forecastList.value.forEach((forecast) => {
    const cityDate = new Date((forecast.dt + forecastTimezone.value) * 1000)
    const dateKey = cityDate.toISOString().slice(0, 10)

    if (!dailyGroups.has(dateKey)) {
      dailyGroups.set(dateKey, [])
    }

    dailyGroups.get(dateKey).push(forecast)
  })

  return [...dailyGroups.entries()].slice(0, 5).map(([dateKey, forecasts]) => {
    // 하루를 대표할 날씨는 현지 정오에 가장 가까운 예보로 선택
    const representative = forecasts.reduce((closest, forecast) => {
      const closestHour = new Date(
        (closest.dt + forecastTimezone.value) * 1000,
      ).getUTCHours()
      const forecastHour = new Date(
        (forecast.dt + forecastTimezone.value) * 1000,
      ).getUTCHours()

      return Math.abs(forecastHour - 12) < Math.abs(closestHour - 12)
        ? forecast
        : closest
    })
    const cityDate = new Date((representative.dt + forecastTimezone.value) * 1000)

    return {
      dateKey,
      dateLabel: new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: 'UTC',
      }).format(cityDate),
      minimumTemperature: configStore.convertTemperature(
        Math.min(...forecasts.map((forecast) => forecast.main.temp_min)),
      ),
      maximumTemperature: configStore.convertTemperature(
        Math.max(...forecasts.map((forecast) => forecast.main.temp_max)),
      ),
      rainChance: Math.round(Math.max(...forecasts.map((forecast) => forecast.pop)) * 100),
      weather: getWeatherDisplay(representative.weather[0]),
    }
  })
})

// 현재 및 24시간 예보가 바뀌면 생활 참고 문구도 computed로 자동 재계산
const weatherWarnings = computed(() => {
  return getWeatherWarnings({
    currentWeather: selectedCity.value,
    forecastList: hourlyForecastList.value,
  })
})

// 예보 카드 선택이 바뀔 때마다 상태 문구를 갱신
watch(selectedForecast, (newForecast) => {
  forecastStatus.value = newForecast
    ? `${formatForecastTime(newForecast.dt)} 예보를 선택했습니다.`
    : ''
})

const handleSelectForecast = (index) => {
  selectedForecastIndex.value = index
}

const retryWeather = () => {
  loadWeather(route.params.cityId)
}
</script>

<template>
  <div class="weather-detail-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Weather / Details</p>
        <h1>{{ selectedLocation?.name ?? '상세 날씨' }}</h1>
        <p class="page-description">
          {{ selectedLocation?.state || '도시 정보를 불러오는 중입니다.' }}
        </p>
      </div>

      <button type="button" class="button-secondary" @click="handleGoBack">
        {{ returnButtonLabel }}
      </button>
    </header>

    <BaseDashboardCard
      eyebrow="Current conditions"
      title="현재 기상 관측"
      description="현재 날씨와 앞으로의 시간별·일별 예보를 확인합니다."
    >
      <div v-if="isLoading" class="detail-state">날씨 정보를 불러오는 중입니다...</div>

      <div v-else-if="errorMessage" class="detail-state error">
        <p>{{ errorMessage }}</p>
        <button type="button" class="button-secondary" @click="retryWeather">
          다시 시도
        </button>
      </div>

      <div v-else-if="selectedCity" class="detail-box">
        <div
          class="detail-header"
          :class="`weather-tone-${currentWeatherDisplay.tone}`"
        >
          <div class="detail-condition-identity">
            <img
              class="weather-icon"
              :src="`https://openweathermap.org/img/wn/${selectedCity.weather[0].icon}@2x.png`"
              :alt="currentWeatherDisplay.label"
            />

            <div>
              <p class="detail-title">{{ selectedLocation.state }} · {{ selectedLocation.country }}</p>

              <p
                class="detail-description"
                :class="`condition-${currentWeatherDisplay.tone}`"
              >
                {{ currentWeatherDisplay.emoji }} {{ currentWeatherDisplay.label }}
              </p>
            </div>
          </div>

          <div class="detail-current-temperature">
            <strong>{{ displayTemperature }}°</strong>
            <span>{{ configStore.unit === 'celsius' ? 'Celsius' : 'Fahrenheit' }}</span>
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

      <section v-if="weatherWarnings.length > 0" class="weather-warning-section">
        <p class="warning-caption">
          생활 참고 안내 · 공식 기상 특보가 아닙니다.
        </p>

        <div class="weather-warning-list">
          <article
            v-for="warning in weatherWarnings"
            :key="warning.id"
            class="weather-warning"
            :class="`warning-${warning.level}`"
          >
            <span class="warning-emoji" aria-hidden="true">{{ warning.emoji }}</span>
            <div>
              <strong>{{ warning.title }}</strong>
              <p>{{ warning.message }}</p>
            </div>
          </article>
        </div>
      </section>

      <section v-if="hourlyForecastList.length > 0" class="forecast-section">
        <div class="forecast-heading">
          <div>
            <p class="forecast-eyebrow">OpenWeather 5 Day / 3 Hour Forecast</p>
            <h3>앞으로 24시간 예보</h3>
          </div>

          <div v-if="forecastSummary" class="forecast-summary">
            <span>
              최고
              <strong>
                {{ forecastSummary.highestTemperature }}{{ configStore.unitSymbol }}
              </strong>
            </span>
            <span>
              최대 강수 확률
              <strong>{{ forecastSummary.highestRainChance }}%</strong>
            </span>
          </div>
        </div>

        <div class="forecast-list">
          <button
            v-for="(forecast, index) in hourlyForecastList"
            :key="forecast.dt"
            type="button"
            class="forecast-card"
            :class="{ 'is-selected': selectedForecastIndex === index }"
            :aria-pressed="selectedForecastIndex === index"
            @click="handleSelectForecast(index)"
          >
            <span class="forecast-time">{{ formatForecastTime(forecast.dt) }}</span>
            <img
              :src="`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`"
              :alt="getWeatherDisplay(forecast.weather[0]).label"
            />
            <strong>
              {{ configStore.convertTemperature(forecast.main.temp) }}{{ configStore.unitSymbol }}
            </strong>
            <span class="forecast-rain">💧 {{ Math.round(forecast.pop * 100) }}%</span>
          </button>
        </div>

        <p class="forecast-status" aria-live="polite">{{ forecastStatus }}</p>

        <div
          v-if="selectedForecast && selectedForecastInfo && selectedForecastWeatherDisplay"
          class="selected-forecast"
        >
          <div class="selected-forecast-title">
            <img
              :src="`https://openweathermap.org/img/wn/${selectedForecast.weather[0].icon}@2x.png`"
              :alt="selectedForecastWeatherDisplay.label"
            />
            <div>
              <span>{{ formatForecastTime(selectedForecast.dt) }}</span>
              <strong>
                {{ selectedForecastWeatherDisplay.emoji }}
                {{ selectedForecastWeatherDisplay.label }}
              </strong>
            </div>
          </div>

          <div class="selected-forecast-grid">
            <p>
              <span>예상 기온</span>
              <strong>
                {{ selectedForecastInfo.temperature }}{{ configStore.unitSymbol }}
              </strong>
            </p>
            <p>
              <span>체감온도</span>
              <strong>{{ selectedForecastInfo.feelsLike }}{{ configStore.unitSymbol }}</strong>
            </p>
            <p>
              <span>강수 확률</span>
              <strong>{{ selectedForecastInfo.rainChance }}%</strong>
            </p>
            <p>
              <span>습도</span>
              <strong>{{ selectedForecast.main.humidity }}%</strong>
            </p>
            <p>
              <span>풍속</span>
              <strong>{{ selectedForecast.wind.speed }}m/s</strong>
            </p>
            <p>
              <span>3시간 강수량</span>
              <strong>{{ selectedForecast.rain?.['3h'] ?? 0 }}mm</strong>
            </p>
          </div>
        </div>
      </section>

      <section v-if="dailyForecastList.length > 0" class="daily-forecast-section">
        <div class="forecast-heading">
          <div>
            <p class="forecast-eyebrow">COMPUTED DAILY SUMMARY</p>
            <h3>5일 날씨 요약</h3>
          </div>
        </div>

        <div class="daily-forecast-list">
          <article
            v-for="day in dailyForecastList"
            :key="day.dateKey"
            class="daily-forecast-card"
            :class="`weather-tone-${day.weather.tone}`"
          >
            <strong class="daily-date">{{ day.dateLabel }}</strong>
            <span class="daily-weather-icon" aria-hidden="true">{{ day.weather.emoji }}</span>
            <span class="daily-weather-label">{{ day.weather.label }}</span>
            <p class="daily-temperature">
              <strong>{{ day.maximumTemperature }}{{ configStore.unitSymbol }}</strong>
              <span>/ {{ day.minimumTemperature }}{{ configStore.unitSymbol }}</span>
            </p>
            <span class="daily-rain">💧 최대 {{ day.rainChance }}%</span>
          </article>
        </div>
      </section>

      <p class="detail-coordinates">
        위치 좌표:
        {{ selectedCity.coord.lat }},
        {{ selectedCity.coord.lon }}
      </p>

      <!-- 동적 cityId 변경 연습: 같은 컴포넌트 안에서 이전·다음 도시로 이동 -->
      <div
        v-if="showDashboardNavigation && (previousCity || nextCity)"
        class="detail-route-actions"
      >
        <button v-if="previousCity" class="btn-city-nav" @click="handleMoveCity(previousCity.key)">
          ← {{ previousCity.name }}
        </button>

        <button v-if="nextCity" class="btn-city-nav next" @click="handleMoveCity(nextCity.key)">
          {{ nextCity.name }} →
        </button>
      </div>

        <button class="button-secondary detail-bottom-back" @click="handleGoBack">
          {{ returnButtonLabel }}
        </button>
      </div>
    </BaseDashboardCard>
  </div>
</template>
