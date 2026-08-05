<script setup>
import { computed } from 'vue'

import { useConfigStore } from '@/stores/configStore.js'
import { getWeatherDisplay } from '@/utils/weatherDisplay.js'

// [Props] 부모가 전달한 도시 날씨 데이터와 즐겨찾기 상태를 받음
const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
  showDashboardAction: {
    type: Boolean,
    default: false,
  },
  inDashboard: {
    type: Boolean,
    default: false,
  },
})

// [Emits] 카드에서 발생한 동작을 부모에게 알림
const emit = defineEmits([
  'select-card',
  'click-detail',
  'toggle-favorite',
  'add-dashboard',
  'remove-dashboard',
])

const configStore = useConfigStore()

// API의 섭씨 기온을 Pinia에서 선택한 단위로 변환
const displayTemperature = computed(() => {
  return configStore.convertTemperature(props.weather.main.temp)
})

const weatherKey = computed(() => {
  return props.weather.locationKey ?? props.weather.id
})

const locationLabel = computed(() => {
  return [props.weather.state, props.weather.country].filter(Boolean).join(' · ')
})

const weatherDisplay = computed(() => {
  return getWeatherDisplay(props.weather.weather[0])
})

const temperatureLabel = computed(() => {
  if (props.weather.main.temp >= 30) {
    return '매우 더움'
  }

  if (props.weather.main.temp >= 20) {
    return '포근함'
  }

  return '서늘함'
})

// [Emits] 카드 전체 클릭 시 선택한 도시 이름을 부모에게 전달
const handleCardClick = () => {
  emit('select-card', props.weather.name) // select-card 이벤트 발생
}

// [Emits] 상세보기 버튼 클릭 시 도시 id를 부모에게 전달
const handleDetailClick = () => {
  emit('click-detail', weatherKey.value) // click-detail 이벤트 발생
}

// [Emits] 즐겨찾기 버튼 클릭 시 도시 id를 부모에게 전달
const handleFavoriteClick = () => {
  emit('toggle-favorite', weatherKey.value) // toggle-favorite 이벤트 발생
}

const handleAddDashboard = () => {
  emit('add-dashboard', weatherKey.value)
}

const handleRemoveDashboard = () => {
  emit('remove-dashboard', weatherKey.value)
}
</script>

<template>
  <article
    class="weather-card"
    :class="`weather-tone-${weatherDisplay.tone}`"
  >
    <header class="weather-card-header">
      <div>
        <p v-if="locationLabel" class="weather-location">{{ locationLabel }}</p>
        <h3>
          <button type="button" class="weather-card-title-button" @click="handleCardClick">
            {{ props.weather.name }}
          </button>
        </h3>
      </div>

      <button
        class="btn-favorite"
        :class="{ 'is-favorite': props.favorite }"
        type="button"
        :aria-label="
          props.favorite
            ? `${props.weather.name} 즐겨찾기 해제`
            : `${props.weather.name} 즐겨찾기 추가`
        "
        @click.stop="handleFavoriteClick"
      >
        {{ props.favorite ? '★' : '☆' }}
      </button>
    </header>

    <div class="weather-card-current">
      <div class="weather-card-temperature">
        <strong>{{ displayTemperature }}°</strong>
        <span>{{ configStore.unit === 'celsius' ? 'Celsius' : 'Fahrenheit' }}</span>
      </div>

      <div class="weather-card-condition">
        <span class="weather-card-icon" aria-hidden="true">{{ weatherDisplay.emoji }}</span>
        <div>
          <strong>{{ weatherDisplay.label }}</strong>
          <span>{{ temperatureLabel }}</span>
        </div>
      </div>
    </div>

    <dl class="weather-card-metrics">
      <div>
        <dt>습도</dt>
        <dd>{{ props.weather.main.humidity }}%</dd>
      </div>
      <div>
        <dt>바람</dt>
        <dd>{{ props.weather.wind?.speed ?? 0 }}m/s</dd>
      </div>
    </dl>

    <div class="weather-card-actions">

      <button
        v-if="props.showDashboardAction"
        type="button"
        class="btn-dashboard-add"
        :disabled="props.inDashboard"
        @click.stop="handleAddDashboard"
      >
        {{ props.inDashboard ? '대시보드 추가됨' : '대시보드 추가' }}
      </button>

      <button
        v-if="props.removable"
        type="button"
        class="btn-remove-card"
        @click.stop="handleRemoveDashboard"
      >
        삭제
      </button>

      <button class="btn-detail" type="button" @click.stop="handleDetailClick">
        상세보기
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </article>
</template>
