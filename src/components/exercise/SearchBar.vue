<script setup>
// [Props] 부모(WeatherParent)가 관리하는 검색어를 받음
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
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
  emit('submit-search') // submit-search 이벤트 발생
}
</script>

<template>
  <section class="search-box">
    <h3>도시 검색</h3>
    <!-- Props로 받은 검색어를 input의 현재 값으로 표시 -->
    <input
      :value="props.searchQuery"
      @input="handleInput"
      @keyup.enter="handleSubmit"
      placeholder="도시를 검색하세요"
    />
    <!-- input 이벤트는 handleInput을 통해 부모에게 전달됨 -->
    <p>
      검색 중인 도시:
      <strong>{{ props.searchQuery || '입력 대기 중' }}</strong>
      <!-- Props로 받은 검색어 출력 -->
    </p>
  </section>
</template>
