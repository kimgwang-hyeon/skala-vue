<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <h1>☁️ 과제 4: 라우터적용</h1>

    <!-- 상단 내비게이션 바 -->
    <nav class="nav-bar">
      <RouterLink to="/">🌤️ 날씨 대시보드</RouterLink>
      <RouterLink to="/favorites">⭐ 즐겨찾기</RouterLink>
      <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
    </nav>

    <!-- 메인 페이지 렌더링 영역 -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
