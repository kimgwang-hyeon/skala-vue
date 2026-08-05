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
    @click="handleCardClick"
  >
    <header class="weather-card-header">
      <div>
        <p v-if="locationLabel" class="weather-location">{{ locationLabel }}</p>
        <h3>
          <button type="button" class="weather-card-title-button" @click.stop="handleCardClick">
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

<style scoped>
.weather-card {
  display: flex;
  min-height: 300px;
  margin: 0;
  padding: 20px;
  color: var(--text-primary);
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 11px;
  box-shadow: none;
  cursor: pointer;
  flex-direction: column;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.weather-card:first-of-type {
  margin-top: 0;
}

.weather-card.weather-tone-clear,
.weather-card.weather-tone-cloud,
.weather-card.weather-tone-rain,
.weather-card.weather-tone-snow,
.weather-card.weather-tone-storm,
.weather-card.weather-tone-default,
.weather-card.weather-tone-mist {
  background: var(--surface-primary);
}

.weather-card:hover {
  background: var(--surface-primary);
  border-color: var(--border-default);
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.weather-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.weather-card-header h3 {
  margin: 4px 0 0;
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 620;
  letter-spacing: -0.04em;
}

.weather-card-title-button {
  margin: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  letter-spacing: inherit;
}

.weather-card-title-button:hover {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

.weather-location {
  margin: 0;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.02em;
}

.btn-favorite {
  display: grid;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--text-tertiary);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: 50%;
  place-items: center;
  font-size: 16px;
}

.btn-favorite:hover,
.btn-favorite.is-favorite {
  color: var(--amber);
  background: var(--amber-soft);
  border-color: color-mix(in srgb, var(--amber) 38%, var(--border-default));
}

.weather-card-current {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-top: 28px;
}

.weather-card-temperature {
  display: flex;
  align-items: flex-start;
}

.weather-card-temperature strong {
  color: var(--text-primary);
  font-size: 48px;
  font-weight: 450;
  line-height: 0.85;
  letter-spacing: -0.07em;
}

.weather-card-temperature > span {
  margin: 4px 0 0 5px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 9px;
}

.weather-card-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: right;
}

.weather-card-icon {
  font-size: 24px;
  line-height: 1;
}

.weather-card-condition > div {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.weather-card-condition strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 620;
}

.weather-card-condition > div span {
  color: var(--text-tertiary);
  font-size: 10px;
}

.weather-card-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 25px 0 0;
  background: var(--surface-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.weather-card-metrics > div {
  padding: 10px 12px;
}

.weather-card-metrics > div + div {
  border-left: 1px solid var(--border-subtle);
}

.weather-card-metrics dd {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 620;
}

.weather-card-actions {
  position: static;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: auto;
  gap: 7px;
  margin-top: auto;
  padding-top: 18px;
  border-top: 0;
  flex-wrap: nowrap;
}

.btn-detail,
.btn-remove-card,
.btn-dashboard-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 32px;
  margin: 0;
  padding: 0 10px;
  color: var(--text-secondary);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.btn-detail:hover,
.btn-remove-card:hover,
.btn-dashboard-add:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--surface-secondary);
  border-color: var(--border-strong);
}

.btn-remove-card {
  color: var(--red);
  border-color: color-mix(in srgb, var(--red) 24%, var(--border-default));
}

.btn-dashboard-add:disabled {
  color: var(--green);
  background: var(--green-soft);
  border-color: transparent;
  opacity: 1;
}
</style>
