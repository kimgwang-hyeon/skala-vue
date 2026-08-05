<script setup>
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
        @input="handleInput"
        @keyup.enter="handleSubmit"
      />

      <button
        v-if="props.showSubmitButton"
        type="button"
        class="search-submit-button"
        :disabled="props.submitDisabled"
        @click="handleSubmit"
      >
        {{ props.submitLabel }}
      </button>
    </div>
    <!-- input 이벤트는 handleInput을 통해 부모에게 전달됨 -->
    <p v-if="props.showStatus">
      {{ props.statusLabel }}:
      <strong>{{ props.searchQuery || '입력 대기 중' }}</strong>
      <!-- Props로 받은 검색어 출력 -->
    </p>
  </section>
</template>
