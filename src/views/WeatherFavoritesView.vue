<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { fetchCurrentWeather } from '@/api/weatherApi.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'

const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

const favoriteWeatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const selectedCityInfo = ref('즐겨찾기 카드를 선택해 보세요.')
let favoriteRequestId = 0

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

// Pinia에 저장된 모든 즐겨찾기 도시의 실제 날씨를 동시에 요청
const loadFavoriteWeather = async () => {
  const requestId = ++favoriteRequestId
  const locations = [...weatherStore.favoriteCities]

  if (locations.length === 0) {
    favoriteWeatherList.value = []
    errorMessage.value = ''
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const responses = await Promise.allSettled(
    locations.map((location) => fetchCurrentWeather(location.coord)),
  )

  if (requestId !== favoriteRequestId) {
    return
  }

  favoriteWeatherList.value = responses.flatMap((response, index) => {
    return response.status === 'fulfilled'
      ? [createWeatherItem(locations[index], response.value.data)]
      : []
  })

  const failedCount = responses.length - favoriteWeatherList.value.length

  if (failedCount > 0) {
    errorMessage.value = `${failedCount}개 즐겨찾기 도시의 날씨를 불러오지 못했습니다.`
  }

  isLoading.value = false
}

watch(
  () => weatherStore.favoriteCities.map((location) => location.key).join('|'),
  loadFavoriteWeather,
  { immediate: true },
)

// computed 실습: 즐겨찾기 도시의 평균 기온 계산
const favoriteSummary = computed(() => {
  if (favoriteWeatherList.value.length === 0) {
    return null
  }

  const average =
    favoriteWeatherList.value.reduce((sum, item) => sum + item.main.temp, 0) /
    favoriteWeatherList.value.length

  return {
    count: favoriteWeatherList.value.length,
    averageTemperature: configStore.convertTemperature(average),
  }
})

const toggleFavorite = (locationKey) => {
  const location = weatherStore.findLocation(locationKey)

  if (location) {
    weatherStore.toggleFavorite(location)
    selectedCityInfo.value = `${location.name} 즐겨찾기를 해제했습니다.`
  }
}

const handleSelectCard = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

const handleClickDetail = (locationKey) => {
  router.push({
    name: 'weather-detail',
    params: { cityId: locationKey },
    query: { from: 'favorites' },
  })
}
</script>

<template>
  <div class="favorite-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Weather / Saved</p>
        <h1>즐겨찾기</h1>
        <p class="page-description">자주 확인하는 도시의 현재 날씨를 모아 봅니다.</p>
      </div>

      <RouterLink class="button-primary" :to="{ name: 'search' }">
        <span aria-hidden="true">＋</span>
        도시 찾기
      </RouterLink>
    </header>

    <BaseDashboardCard
      eyebrow="Saved cities"
      title="저장한 도시"
      description="즐겨찾기는 모든 페이지에서 Pinia 상태로 공유됩니다."
    >
      <template #actions>
        <button type="button" class="button-secondary" @click="loadFavoriteWeather">
          새로고침
        </button>
      </template>

      <div v-if="favoriteSummary" class="favorite-summary-grid">
        <div>
          <span>저장한 도시</span>
          <strong>{{ favoriteSummary.count }}</strong>
        </div>
        <div>
          <span>평균 기온</span>
          <strong>
            {{ favoriteSummary.averageTemperature }}{{ configStore.unitSymbol }}
          </strong>
        </div>
      </div>

      <p v-if="isLoading && favoriteWeatherList.length === 0" class="detail-state">
        즐겨찾기 도시의 날씨를 불러오는 중입니다...
      </p>

      <p v-if="errorMessage" class="inline-alert">{{ errorMessage }}</p>

      <div
        v-if="!isLoading && weatherStore.favoriteCities.length === 0"
        class="empty-message"
      >
        <div>
          <strong>아직 저장한 도시가 없습니다.</strong>
          <p>도시 카드의 별표를 누르면 이곳에서 빠르게 다시 확인할 수 있습니다.</p>
        </div>
        <RouterLink class="button-primary" :to="{ name: 'search' }">
          대한민국 도시 검색
        </RouterLink>
      </div>

      <div v-if="favoriteWeatherList.length > 0" class="weather-card-grid favorite-card-grid">
        <WeatherCard
          v-for="item in favoriteWeatherList"
          :key="item.locationKey"
          :weather="item"
          :favorite="true"
          @select-card="handleSelectCard"
          @click-detail="handleClickDetail"
          @toggle-favorite="toggleFavorite"
        />
      </div>
    </BaseDashboardCard>

    <div class="status-bar" aria-live="polite">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
