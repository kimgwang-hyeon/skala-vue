<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <h2>🌞❓</h2>
    <h3>페이지를 찾을 수 없습니다.</h3>

    <p>요청하신 주소가 존재하지 않거나 아직 개발되지 않았습니다.</p>

    <RouterLink class="route-button" :to="{ name: 'home' }">날씨 메인으로 이동</RouterLink>
  </section>
</template>
