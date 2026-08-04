<script setup>
import { RouterLink, RouterView } from 'vue-router'

import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-container">
    <div class="app-title-row">
      <h1>☁️ 과제 5: 스토어 적용</h1>
    </div>

    <!-- 상단 내비게이션 바 -->
    <nav class="nav-bar">
      <div class="nav-links">
        <RouterLink to="/">🌤️ 날씨 대시보드</RouterLink>
        <RouterLink to="/favorites">⭐ 즐겨찾기</RouterLink>
        <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
      </div>

      <!-- PDF 191페이지: Navigation Bar 옆에 UnitToggler 배치 -->
      <UnitToggler />
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
