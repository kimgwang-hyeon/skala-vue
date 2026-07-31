<script setup>
import { ref } from 'vue'

// 1. 일반 변수 (화면이 실시간으로 바뀌지 않음)
let normalCount = 0

// 2. 반응성 변수(화면이 실시간으로 바뀜)
const vueCount = ref(0)
</script>

<template>
  <div>
    <h2>Hello Skala-Vue</h2>
    <h3>일반 변수 클릭: {{ normalCount }}</h3>
    <button @click="normalCount++">일반 변수 증가</button>
    <br />
    <br />
    <h3>반응성 변수 클릭: {{ vueCount }}</h3>
    <button @click="vueCount++">반응성 변수 증가</button>
  </div>
</template>
