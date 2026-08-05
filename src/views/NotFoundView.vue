<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <p class="not-found-code">404 / Not found</p>
    <h1>페이지를 찾을 수 없습니다.</h1>
    <p>요청하신 주소가 존재하지 않거나 아직 개발되지 않았습니다.</p>

    <RouterLink class="button-primary" :to="{ name: 'home' }">대시보드로 이동</RouterLink>
  </section>
</template>
