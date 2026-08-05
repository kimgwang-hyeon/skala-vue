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

<style scoped>
.location-suggestions {
  margin-top: 12px;
  overflow: hidden;
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: 9px;
  box-shadow: var(--shadow-small);
}

.location-suggestions-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.location-suggestions-heading strong {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.location-suggestions-heading span {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.location-suggestion-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.location-suggestion-list li + li {
  border-top: 1px solid var(--border-subtle);
}

.location-suggestion-button {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 54px;
  padding: 9px 12px;
  color: var(--text-primary);
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.location-suggestion-button:hover {
  background: var(--surface-secondary);
}

.location-suggestion-button > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.location-suggestion-button strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 640;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-suggestion-button small {
  overflow: hidden;
  color: var(--text-tertiary);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-suggestion-marker {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--text-secondary);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

.location-suggestion-marker::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 5px;
  height: 5px;
  background: var(--text-secondary);
  border-radius: 50%;
  content: '';
}

.location-suggestion-arrow {
  color: var(--text-tertiary);
  font-size: 12px;
}

.location-suggestion-state {
  margin: 0;
  padding: 15px 12px;
  color: var(--text-secondary);
  font-size: 10px;
}

.location-suggestion-state.error {
  color: var(--red);
}
</style>
