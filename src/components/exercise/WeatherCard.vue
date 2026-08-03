<script setup>
// [Props] 부모가 전달한 도시 날씨 데이터와 상세보기 상태를 받음
const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

// [Emits] 카드 선택과 상세보기 버튼 클릭을 부모에게 알림
const emit = defineEmits(['select-card', 'click-detail'])

// [Emits] 카드 전체 클릭 시 선택한 도시 이름을 부모에게 전달
const handleCardClick = () => {
  emit('select-card', props.weather.name) // select-card 이벤트 발생
}

// [Emits] 상세보기 버튼 클릭 시 도시 id를 부모에게 전달
const handleDetailClick = () => {
  emit('click-detail', props.weather.id) // click-detail 이벤트 발생
}
</script>

<template>
  <article class="weather-card" @click="handleCardClick">
    <!-- weather Props에서 도시명과 날씨 정보를 꺼내서 출력 -->
    <h4>{{ props.weather.name }}</h4>
    <p>기온 : {{ props.weather.main.temp }}°C</p>
    <p>상태 : {{ props.weather.weather[0].description }}</p>
    <span
      class="badge"
      :class="{
        hot: props.weather.main.temp >= 30,
        warm: props.weather.main.temp >= 20 && props.weather.main.temp < 30,
        cool: props.weather.main.temp < 20,
      }"
    >
      <span v-if="props.weather.main.temp >= 30">🔥 무지 더움</span>
      <span v-else-if="props.weather.main.temp >= 20">☀️ 포근함</span>
      <span v-else>❄️ 서늘함</span>
    </span>

    <!-- isOpen Props가 true이면 상세 영역을 열어 둠 -->
    <button class="btn-detail" @click.stop="handleDetailClick">
      {{ props.isOpen ? '닫기' : '상세보기' }}
    </button>

    <!-- 부모가 전달한 isOpen Props에 따라 상세 영역 표시 -->
    <div v-show="props.isOpen" class="detail-box">
      <div class="detail-header">
        <img
          class="weather-icon"
          :src="`https://openweathermap.org/img/wn/${props.weather.weather[0].icon}@2x.png`"
          :alt="props.weather.weather[0].description"
        />
        <div>
          <p class="detail-title">상세 날씨</p>
          <p class="detail-description">{{ props.weather.weather[0].description }}</p>
        </div>
      </div>

      <div class="detail-grid">
        <p>
          <span>체감온도</span><strong>{{ props.weather.main.feels_like }}°C</strong>
        </p>
        <p>
          <span>최저/최고</span
          ><strong
            >{{ props.weather.main.temp_min }}°C /
            {{ props.weather.main.temp_max }}°C</strong
          >
        </p>
        <p>
          <span>습도</span><strong>{{ props.weather.main.humidity }}%</strong>
        </p>
        <p>
          <span>기압</span><strong>{{ props.weather.main.pressure }}hPa</strong>
        </p>
        <p>
          <span>풍속</span><strong>{{ props.weather.wind.speed }}m/s</strong>
        </p>
        <p>
          <span>풍향</span><strong>{{ props.weather.wind.deg }}°</strong>
        </p>
        <p>
          <span>구름량</span><strong>{{ props.weather.clouds.all }}%</strong>
        </p>
        <p>
          <span>가시거리</span><strong>{{ props.weather.visibility / 1000 }}km</strong>
        </p>
      </div>

      <div v-if="props.weather.rain || props.weather.snow" class="detail-extra">
        <p v-if="props.weather.rain">
          🌧️ 최근 1시간 강수량: {{ props.weather.rain['1h'] }}mm
        </p>
        <p v-if="props.weather.snow">
          ❄️ 최근 1시간 적설량: {{ props.weather.snow['1h'] }}mm
        </p>
      </div>

      <p class="detail-coordinates">
        위치 좌표: {{ props.weather.coord.lat }}, {{ props.weather.coord.lon }}
      </p>
    </div>
  </article>
</template>
