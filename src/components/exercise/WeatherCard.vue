<script setup>
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
})

// [Emits] 카드 선택, 상세보기, 즐겨찾기 버튼 클릭을 부모에게 알림
const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

// [Emits] 카드 전체 클릭 시 선택한 도시 이름을 부모에게 전달
const handleCardClick = () => {
  emit('select-card', props.weather.name) // select-card 이벤트 발생
}

// [Emits] 상세보기 버튼 클릭 시 도시 id를 부모에게 전달
const handleDetailClick = () => {
  emit('click-detail', props.weather.id) // click-detail 이벤트 발생
}

// [Emits] 즐겨찾기 버튼 클릭 시 도시 id를 부모에게 전달
const handleFavoriteClick = () => {
  emit('toggle-favorite', props.weather.id) // toggle-favorite 이벤트 발생
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

    <button class="btn-detail" @click.stop="handleDetailClick">상세보기</button>
  </article>
</template>
