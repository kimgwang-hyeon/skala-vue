<script setup>
import PrimeButton from 'primevue/button'

// [Props] 부모(WeatherParent)가 관리하는 검색어를 받음
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '도시를 검색하세요',
  },
  statusLabel: {
    type: String,
    default: '검색 중인 도시',
  },
  showSubmitButton: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: '검색',
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
  suggestionsId: {
    type: String,
    default: '',
  },
  suggestionsVisible: {
    type: Boolean,
    default: false,
  },
})

// [Emits] 자식에서 부모로 보낼 이벤트 이름 등록
const emit = defineEmits(['update-query', 'submit-search'])

// [Emits] input 이벤트가 발생할 때마다 변경된 검색어를 부모에게 전달
const handleInput = (event) => {
  emit('update-query', event.target.value) // update-query 이벤트 발생
}

// [Emits] Enter 입력 시 부모에게 검색 실행을 요청
const handleSubmit = () => {
  if (!props.submitDisabled) {
    emit('submit-search') // submit-search 이벤트 발생
  }
}
</script>

<template>
  <section class="search-box" :class="{ 'is-compact': props.compact }">
    <h3 v-if="!props.compact">도시 검색</h3>
    <!-- Props로 받은 검색어를 input의 현재 값으로 표시 -->
    <div class="search-input-row">
      <svg class="search-input-icon" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        type="search"
        :value="props.searchQuery"
        :placeholder="props.placeholder"
        :aria-label="props.placeholder"
        :aria-controls="props.suggestionsId || undefined"
        :aria-expanded="props.suggestionsId ? props.suggestionsVisible : undefined"
        :aria-autocomplete="props.suggestionsId ? 'list' : undefined"
        autocomplete="off"
        @input="handleInput"
        @keyup.enter="handleSubmit"
      />

      <PrimeButton
        v-if="props.showSubmitButton"
        type="button"
        class="search-submit-button"
        :label="props.submitLabel"
        :disabled="props.submitDisabled"
        @click="handleSubmit"
      />
    </div>
    <!-- input 이벤트는 handleInput을 통해 부모에게 전달됨 -->
    <p v-if="props.showStatus">
      {{ props.statusLabel }}:
      <strong>{{ props.searchQuery || '입력 대기 중' }}</strong>
      <!-- Props로 받은 검색어 출력 -->
    </p>
  </section>
</template>

<style scoped>
.search-input-row {
  position: relative;
}

.search-input-icon {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 13px;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: var(--text-tertiary);
  stroke-linecap: round;
  stroke-width: 1.7;
  transform: translateY(-50%);
}

.search-box input {
  min-height: 42px;
  padding: 0 14px 0 40px;
  color: var(--text-primary);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: 7px;
  outline: 0;
  box-shadow: none;
}

.search-box input:focus {
  border-color: var(--border-strong);
  box-shadow: var(--focus-ring);
}

.search-submit-button {
  min-height: 42px;
  padding: 0 14px;
  color: var(--text-inverted);
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 7px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 620;
}

.search-submit-button:hover:not(:disabled) {
  color: var(--text-inverted);
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.search-submit-button:disabled {
  color: var(--text-tertiary);
  background: var(--surface-tertiary);
  border-color: var(--border-subtle);
  opacity: 0.75;
}
</style>
