<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { weatherMockList } from '@/data/weatherMock.js'
import { getFavoriteCityIds, saveFavoriteCityIds } from '@/utils/weatherStorage.js'

const router = useRouter()
const favoriteCityIds = ref(getFavoriteCityIds())
const selectedCityInfo = ref('즐겨찾기 카드를 선택해 보세요.')

// 즐겨찾기 id에 해당하는 도시만 화면에 표시
const favoriteWeatherList = computed(() => {
  return weatherMockList.filter((item) => favoriteCityIds.value.includes(item.id))
})

const toggleFavorite = (cityId) => {
  favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== Number(cityId))
  saveFavoriteCityIds(favoriteCityIds.value)
}

const handleSelectCard = (cityName) => {
  selectedCityInfo.value = `${cityName}이 선택되었습니다.`
}

const handleClickDetail = (cityId) => {
  router.push({
    name: 'weather-detail',
    params: { cityId },
  })
}
</script>

<template>
  <div class="dashboard-wrapper favorite-page">
    <BaseDashboardCard title="즐겨찾기 지역">
      <p v-if="favoriteWeatherList.length === 0" class="empty-message">
        즐겨찾기한 지역이 없습니다.
        <RouterLink class="route-button" :to="{ name: 'home' }">
          날씨 대시보드에서 추가하기
        </RouterLink>
      </p>

      <WeatherCard
        v-for="item in favoriteWeatherList"
        :key="item.id"
        :weather="item"
        :favorite="true"
        @select-card="handleSelectCard"
        @click-detail="handleClickDetail"
        @toggle-favorite="toggleFavorite"
      />
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
