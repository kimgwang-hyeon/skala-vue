<script setup>
// 부모가 전달하는 카드 제목 Props
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="dashboard-card">
    <h2>{{ title }}</h2> <!-- title Props 출력 -->
    <slot></slot> <!-- 부모가 넣은 검색창 또는 날씨 카드 출력 -->
  </section>
</template>
