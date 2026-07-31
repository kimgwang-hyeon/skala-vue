<script setup>
import { ref } from 'vue'

const text1 = ref('')
const text2 = ref('')
const text3 = ref('')
const text4 = ref('')
</script>

<template>
  <div class="practice-section">
    <h3>1) :value만 — 변수 → input</h3>

    <input :value="text1" placeholder="직접 입력해 보세요" />
    <p>변수값: {{ text1 }}</p>

    <button @click="text1 = '코드에서 바꾼 값'">코드에서 text1 변경</button>

    <p>직접 입력해도 변수값은 안 바뀝니다. 버튼을 누르면 input 값은 바뀝니다.</p>

    <hr />

    <h3>2) @input만 — input → 변수</h3>

    <input @input="(e) => (text2 = e.target.value)" placeholder="직접 입력해 보세요" />
    <p>변수값: {{ text2 }}</p>

    <button @click="text2 = '코드에서 바꾼 값'">코드에서 text2 변경</button>

    <p>직접 입력하면 변수값은 바뀝니다. 버튼을 눌러도 input 값은 안 바뀝니다.</p>

    <hr />

    <h3>3) :value + @input — 양방향</h3>

    <input
      :value="text3"
      @input="(e) => (text3 = e.target.value)"
      placeholder="직접 입력해 보세요"
    />
    <p>변수값: {{ text3 }}</p>

    <button @click="text3 = '코드에서 바꾼 값'">코드에서 text3 변경</button>

    <p>직접 입력해도 변수값이 바뀌고, 버튼을 눌러도 input 값이 바뀝니다.</p>

    <hr />

    <h3>4) v-model — 3번의 축약형</h3>

    <input v-model="text4" placeholder="직접 입력해 보세요" />
    <p>변수값: {{ text4 }}</p>

    <button @click="text4 = '코드에서 바꾼 값'">코드에서 text4 변경</button>

    <p>3번과 같은 양방향 동작을 더 짧게 쓴 문법입니다.</p>
  </div>
</template>
