<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { fetchCurrentWeather } from '@/api/weatherApi.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { getWeatherDisplay } from '@/utils/weatherDisplay.js'

const VENTUSKY_LAYERS = [
  { value: 'temperature-2m', label: '🌡️ 기온' },
  { value: 'gust', label: '💨 강풍' },
]

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

const selectedLayer = ref('temperature-2m')
const selectedCityKey = ref(weatherStore.dashboardCities[0]?.key ?? '')
const mapFrameVersion = ref(0)
const isMapExpanded = ref(false)
const selectedWeather = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
let weatherRequestId = 0

const selectedLocation = computed(() => {
  return weatherStore.findLocation(selectedCityKey.value)
})

// 선택한 도시를 중심으로 표시하고, 대시보드 도시는 Ventusky 핀으로 전달
const ventuskyUrl = computed(() => {
  const center = selectedLocation.value?.coord ?? { lat: 36.4, lon: 127.8 }
  const pins = weatherStore.dashboardCities
    .map((location) => {
      return `${location.coord.lat};${location.coord.lon};dot;${encodeURIComponent(location.name)}`
    })
    .join(';')

  const baseUrl =
    `https://embed.ventusky.com/?p=${center.lat};${center.lon};7` +
    `&l=${selectedLayer.value}&w=soft`

  return pins ? `${baseUrl}&pin=${pins}` : baseUrl
})

// iframe 전용 주소가 아닌 Ventusky 일반 사이트 주소 (새 탭용)
const ventuskySiteUrl = computed(() => {
  const center = selectedLocation.value?.coord ?? { lat: 36.4, lon: 127.8 }
  const params = new URLSearchParams({
    p: `${center.lat};${center.lon};7`,
    l: selectedLayer.value,
  })

  return `https://www.ventusky.com/?${params.toString()}`
})

const ventuskyFrameKey = computed(() => {
  return `${ventuskyUrl.value}-${mapFrameVersion.value}`
})

const weatherDisplay = computed(() => {
  return selectedWeather.value
    ? getWeatherDisplay(selectedWeather.value.weather[0])
    : null
})

const displayTemperature = computed(() => {
  return selectedWeather.value
    ? configStore.convertTemperature(selectedWeather.value.main.temp)
    : ''
})

// 도시 선택이 바뀌면 해당 좌표의 OpenWeather 현재 날씨를 다시 요청
const loadSelectedWeather = async () => {
  const location = selectedLocation.value

  if (!location) {
    selectedWeather.value = null
    return
  }

  const requestId = ++weatherRequestId
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchCurrentWeather(location.coord)

    if (requestId === weatherRequestId) {
      selectedWeather.value = response.data
    }
  } catch (error) {
    if (requestId === weatherRequestId) {
      errorMessage.value =
        error.response?.status === 401
          ? 'OpenWeather API 키를 확인해 주세요.'
          : '선택한 도시의 날씨를 불러오지 못했습니다.'
    }
  } finally {
    if (requestId === weatherRequestId) {
      isLoading.value = false
    }
  }
}

watch(() => selectedLocation.value?.key, loadSelectedWeather, { immediate: true })

// 다른 화면에서 대시보드 도시가 삭제된 경우 첫 번째 도시로 선택값 보정
watch(
  () => weatherStore.dashboardCities.map((location) => location.key).join('|'),
  () => {
    if (!weatherStore.isInDashboard(selectedCityKey.value)) {
      selectedCityKey.value = weatherStore.dashboardCities[0]?.key ?? ''
    }
  },
)

const handleOpenDetail = () => {
  if (!selectedLocation.value) {
    return
  }

  router.push({
    name: 'weather-detail',
    params: { cityId: selectedLocation.value.key },
    query: { from: 'map' },
  })
}

// iframe 내부 링크로 이동했을 때 처음 지도로 복원
const resetVentuskyMap = () => {
  mapFrameVersion.value += 1
}
</script>

<template>
  <div class="ventusky-page">
    <BaseDashboardCard
      eyebrow="Interactive map"
      title="실시간 날씨 지도"
      description="Ventusky의 흐름 지도와 OpenWeather의 현재 날씨를 함께 확인합니다."
    >
      <template #actions>
        <button type="button" class="button-secondary" @click="resetVentuskyMap">
          지도 초기화
        </button>
        <button
          type="button"
          class="button-secondary"
          @click="isMapExpanded = !isMapExpanded"
        >
          {{ isMapExpanded ? '작게 보기' : '크게 보기' }}
        </button>
        <a
          class="button-primary"
          :href="ventuskySiteUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          원본 지도 ↗
        </a>
      </template>

      <div class="ventusky-controls">
        <div class="ventusky-layer-buttons" aria-label="지도 레이어 선택">
          <button
            v-for="layer in VENTUSKY_LAYERS"
            :key="layer.value"
            type="button"
            :class="{ 'is-active': selectedLayer === layer.value }"
            @click="selectedLayer = layer.value"
          >
            {{ layer.label }}
          </button>
        </div>

        <label>
          <span>도시 선택</span>
          <select v-model="selectedCityKey" :disabled="weatherStore.dashboardCities.length === 0">
            <option v-if="weatherStore.dashboardCities.length === 0" value="">
              등록된 도시 없음
            </option>
            <option
              v-for="location in weatherStore.dashboardCities"
              :key="location.key"
              :value="location.key"
            >
              {{ location.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="map-workspace-grid">
        <div class="map-canvas-column">
          <div
            class="ventusky-frame-wrapper"
            :class="{ 'is-expanded': isMapExpanded }"
          >
            <iframe
              :key="ventuskyFrameKey"
              :src="ventuskyUrl"
              class="ventusky-frame"
              title="Ventusky 실시간 날씨 지도"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms"
            ></iframe>
          </div>

          <p class="ventusky-guide">
            시간축을 움직여 예보 시간을 바꿀 수 있습니다. 지도 제공: Ventusky
          </p>
        </div>

        <section v-if="selectedLocation" class="map-city-summary">
          <p class="map-summary-eyebrow">Selected city</p>

          <p v-if="isLoading" class="map-summary-state">
            {{ selectedLocation.name }} 날씨를 불러오는 중입니다...
          </p>

          <p v-else-if="errorMessage" class="map-summary-state error">
            {{ errorMessage }}
          </p>

          <template v-else-if="selectedWeather && weatherDisplay">
            <span class="map-summary-emoji" aria-hidden="true">
              {{ weatherDisplay.emoji }}
            </span>

            <div class="map-summary-city">
              <span>{{ selectedLocation.state }}</span>
              <strong>{{ selectedLocation.name }}</strong>
              <p>{{ weatherDisplay.label }}</p>
            </div>

            <div class="map-summary-values">
              <p>
                <span>현재 기온</span>
                <strong>{{ displayTemperature }}{{ configStore.unitSymbol }}</strong>
              </p>
              <p>
                <span>습도</span>
                <strong>{{ selectedWeather.main.humidity }}%</strong>
              </p>
              <p>
                <span>풍속</span>
                <strong>{{ selectedWeather.wind.speed }}m/s</strong>
              </p>
            </div>

            <button type="button" class="button-primary" @click="handleOpenDetail">
              상세 날씨
              <span aria-hidden="true">→</span>
            </button>
          </template>
        </section>
      </div>
    </BaseDashboardCard>
  </div>
</template>
