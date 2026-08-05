<script setup>
// [Props] 카카오 지역 후보 목록과 조회 상태를 부모에게서 받아 표시만 담당
defineProps({
  suggestions: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  listId: {
    type: String,
    default: '',
  },
  heading: {
    type: String,
    default: '지역 후보',
  },
})

// [Emits] 후보를 고르면 해당 도시 객체를 부모에게 전달
defineEmits(['select'])
</script>

<template>
  <section
    :id="listId || undefined"
    class="location-suggestions"
    aria-label="카카오 지역 검색 후보"
    aria-live="polite"
  >
    <div class="location-suggestions-heading">
      <strong>{{ heading }}</strong>
      <span>Kakao Local</span>
    </div>

    <p v-if="isLoading" class="location-suggestion-state">입력한 지역을 찾고 있습니다...</p>

    <p v-else-if="errorMessage" class="location-suggestion-state error">
      {{ errorMessage }}
    </p>

    <ul v-else-if="suggestions.length > 0" class="location-suggestion-list">
      <li v-for="location in suggestions" :key="location.key">
        <button
          type="button"
          class="location-suggestion-button"
          :aria-label="`${location.addressName} 선택`"
          @click="$emit('select', location)"
        >
          <span class="location-suggestion-marker" aria-hidden="true"></span>
          <span>
            <strong>{{ location.name }}</strong>
            <small>{{ location.addressName }}</small>
          </span>
          <span class="location-suggestion-arrow" aria-hidden="true">→</span>
        </button>
      </li>
    </ul>

    <p v-else class="location-suggestion-state">일치하는 대한민국 행정구역이 없습니다.</p>
  </section>
</template>
