<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { fetchCurrentWeather } from '@/api/weatherApi.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { getWeatherDisplay } from '@/utils/weatherDisplay.js'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

const comparisonLocations = computed(() => weatherStore.knownCities)

const getRouteKey = (value, fallbackIndex) => {
  const routeKey = typeof value === 'string' ? value : ''
  return weatherStore.findLocation(routeKey)?.key ?? comparisonLocations.value[fallbackIndex]?.key ?? ''
}

const leftLocationKey = ref(getRouteKey(route.query.left, 0))
const initialRightKey = getRouteKey(route.query.right, 1)
const rightLocationKey = ref(
  initialRightKey === leftLocationKey.value
    ? comparisonLocations.value.find((item) => item.key !== leftLocationKey.value)?.key ?? ''
    : initialRightKey,
)

const leftWeather = ref(null)
const rightWeather = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
let comparisonRequestId = 0

const leftLocation = computed(() => weatherStore.findLocation(leftLocationKey.value))
const rightLocation = computed(() => weatherStore.findLocation(rightLocationKey.value))

const loadComparison = async () => {
  const requestId = ++comparisonRequestId

  // 앞선 요청이 진행 중이어도 여기서 끝내므로 로딩 상태를 직접 해제해야 함
  if (!leftLocation.value || !rightLocation.value) {
    errorMessage.value = '비교할 도시 두 곳을 선택해 주세요.'
    isLoading.value = false
    return
  }

  if (leftLocationKey.value === rightLocationKey.value) {
    leftWeather.value = null
    rightWeather.value = null
    errorMessage.value = '서로 다른 두 도시를 선택해 주세요.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [leftResponse, rightResponse] = await Promise.all([
      fetchCurrentWeather(leftLocation.value.coord),
      fetchCurrentWeather(rightLocation.value.coord),
    ])

    if (requestId !== comparisonRequestId) {
      return
    }

    leftWeather.value = leftResponse.data
    rightWeather.value = rightResponse.data
  } catch (error) {
    if (requestId !== comparisonRequestId) {
      return
    }

    errorMessage.value =
      error.response?.status === 401
        ? 'OpenWeather API 키를 확인해 주세요.'
        : '두 도시의 날씨를 비교하지 못했습니다.'
  } finally {
    if (requestId === comparisonRequestId) {
      isLoading.value = false
    }
  }
}

// select 값이 바뀌면 URL과 API 결과를 함께 갱신
watch(
  [leftLocationKey, rightLocationKey],
  ([left, right]) => {
    router.replace({
      name: 'weather-compare',
      query: { left: left || undefined, right: right || undefined },
    })
    loadComparison()
  },
  { immediate: true },
)

const leftWeatherDisplay = computed(() => {
  return leftWeather.value ? getWeatherDisplay(leftWeather.value.weather[0]) : null
})

const rightWeatherDisplay = computed(() => {
  return rightWeather.value ? getWeatherDisplay(rightWeather.value.weather[0]) : null
})

// 마지막 글자에 받침이 있으면 '이', 없으면 '가'를 사용
const getSubjectParticle = (word) => {
  const lastCharacter = word.at(-1)
  const characterCode = lastCharacter?.charCodeAt(0)
  const isHangul = characterCode >= 0xac00 && characterCode <= 0xd7a3

  return isHangul && (characterCode - 0xac00) % 28 !== 0 ? '이' : '가'
}

const getHigherCity = (leftValue, rightValue) => {
  if (leftValue === rightValue) {
    return '같음'
  }

  const higherCityName =
    leftValue > rightValue ? leftLocation.value.name : rightLocation.value.name

  return `${higherCityName}${getSubjectParticle(higherCityName)} 더 높음`
}

// API 원본값과 화면 표시값을 나눠 정렬 기준과 단위 변환을 모두 정확히 처리
const comparisonRows = computed(() => {
  if (!leftWeather.value || !rightWeather.value) {
    return []
  }

  const rows = [
    {
      label: '현재 기온',
      leftRaw: leftWeather.value.main.temp,
      rightRaw: rightWeather.value.main.temp,
      format: (value) => `${configStore.convertTemperature(value)}${configStore.unitSymbol}`,
    },
    {
      label: '체감온도',
      leftRaw: leftWeather.value.main.feels_like,
      rightRaw: rightWeather.value.main.feels_like,
      format: (value) => `${configStore.convertTemperature(value)}${configStore.unitSymbol}`,
    },
    {
      label: '습도',
      leftRaw: leftWeather.value.main.humidity,
      rightRaw: rightWeather.value.main.humidity,
      format: (value) => `${value}%`,
    },
    {
      label: '풍속',
      leftRaw: leftWeather.value.wind.speed,
      rightRaw: rightWeather.value.wind.speed,
      format: (value) => `${value.toFixed(1)}m/s`,
    },
    {
      label: '기압',
      leftRaw: leftWeather.value.main.pressure,
      rightRaw: rightWeather.value.main.pressure,
      format: (value) => `${value}hPa`,
    },
    {
      label: '구름량',
      leftRaw: leftWeather.value.clouds.all,
      rightRaw: rightWeather.value.clouds.all,
      format: (value) => `${value}%`,
    },
  ]

  return rows.map((row) => {
    return {
      label: row.label,
      leftValue: row.format(row.leftRaw),
      rightValue: row.format(row.rightRaw),
      result: getHigherCity(row.leftRaw, row.rightRaw),
    }
  })
})

const comparisonSummary = computed(() => {
  if (!leftWeather.value || !rightWeather.value) {
    return null
  }

  const difference = Math.abs(leftWeather.value.main.temp - rightWeather.value.main.temp)
  const displayDifference =
    configStore.unit === 'celsius' ? difference : (difference * 9) / 5

  return {
    warmerCity: getHigherCity(
      leftWeather.value.main.temp,
      rightWeather.value.main.temp,
    ),
    temperatureDifference: Math.round(displayDifference * 10) / 10,
  }
})

const handleSwapCities = () => {
  const previousLeft = leftLocationKey.value
  leftLocationKey.value = rightLocationKey.value
  rightLocationKey.value = previousLeft
}

const handleOpenDetail = (locationKey) => {
  router.push({
    name: 'weather-detail',
    params: { cityId: locationKey },
    query: {
      from: 'compare',
      left: leftLocationKey.value,
      right: rightLocationKey.value,
    },
  })
}
</script>

<template>
  <div class="compare-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Weather / Compare</p>
        <h1>도시 비교</h1>
        <p class="page-description">두 도시의 현재 날씨를 같은 기준으로 비교합니다.</p>
      </div>
    </header>

    <BaseDashboardCard
      eyebrow="Live comparison"
      title="비교할 도시 선택"
      description="선택값을 watch가 감지해 API를 다시 호출하고 결과를 computed로 계산합니다."
    >

      <div class="compare-selectors">
        <label>
          <span>첫 번째 도시</span>
          <select v-model="leftLocationKey">
            <option
              v-for="location in comparisonLocations"
              :key="location.key"
              :value="location.key"
            >
              {{ location.name }}{{ location.state ? ` · ${location.state}` : '' }}
            </option>
          </select>
        </label>

        <button type="button" class="btn-swap-cities" @click="handleSwapCities">
          <span aria-hidden="true">⇄</span>
          위치 교체
        </button>

        <label>
          <span>두 번째 도시</span>
          <select v-model="rightLocationKey">
            <option
              v-for="location in comparisonLocations"
              :key="location.key"
              :value="location.key"
            >
              {{ location.name }}{{ location.state ? ` · ${location.state}` : '' }}
            </option>
          </select>
        </label>
      </div>

      <p v-if="isLoading" class="detail-state">두 도시의 날씨를 비교하는 중입니다...</p>
      <p v-else-if="errorMessage" class="inline-alert">{{ errorMessage }}</p>

      <template
        v-else-if="leftWeather && rightWeather && leftWeatherDisplay && rightWeatherDisplay"
      >
        <div class="compare-weather-cards">
          <article
            class="compare-weather-card"
            :class="`weather-tone-${leftWeatherDisplay.tone}`"
          >
            <span class="compare-weather-emoji">{{ leftWeatherDisplay.emoji }}</span>
            <div>
              <span>{{ leftLocation.state }}</span>
              <h3>{{ leftLocation.name }}</h3>
              <strong>
                {{ configStore.convertTemperature(leftWeather.main.temp) }}{{
                  configStore.unitSymbol
                }}
              </strong>
              <p>{{ leftWeatherDisplay.label }}</p>
            </div>
            <button
              type="button"
              class="button-secondary"
              @click="handleOpenDetail(leftLocation.key)"
            >
              상세보기 →
            </button>
          </article>

          <article
            class="compare-weather-card"
            :class="`weather-tone-${rightWeatherDisplay.tone}`"
          >
            <span class="compare-weather-emoji">{{ rightWeatherDisplay.emoji }}</span>
            <div>
              <span>{{ rightLocation.state }}</span>
              <h3>{{ rightLocation.name }}</h3>
              <strong>
                {{ configStore.convertTemperature(rightWeather.main.temp) }}{{
                  configStore.unitSymbol
                }}
              </strong>
              <p>{{ rightWeatherDisplay.label }}</p>
            </div>
            <button
              type="button"
              class="button-secondary"
              @click="handleOpenDetail(rightLocation.key)"
            >
              상세보기 →
            </button>
          </article>
        </div>

        <div v-if="comparisonSummary" class="comparison-summary">
          <span>Temperature difference</span>
          <p>
            {{ comparisonSummary.warmerCity }} · 기온 차이
            <strong>
              {{ comparisonSummary.temperatureDifference }}{{ configStore.unitSymbol }}
            </strong>
          </p>
        </div>

        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>비교 항목</th>
                <th>{{ leftLocation.name }}</th>
                <th>{{ rightLocation.name }}</th>
                <th>비교 결과</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.label">
                <th>{{ row.label }}</th>
                <td>{{ row.leftValue }}</td>
                <td>{{ row.rightValue }}</td>
                <td>{{ row.result }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </BaseDashboardCard>
  </div>
</template>
