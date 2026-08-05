<script setup>
import { RouterLink, RouterView } from 'vue-router'

const exploreTabs = [
  {
    label: '도시 검색',
    description: '대한민국 도시를 찾아 대시보드에 추가합니다.',
    to: { name: 'search' },
  },
  {
    label: '날씨 지도',
    description: '기온과 바람의 흐름을 지도에서 확인합니다.',
    to: { name: 'weather-map' },
  },
]
</script>

<template>
  <div class="explore-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">Weather / Explore</p>
        <h1>날씨 탐색</h1>
        <p class="page-description">새로운 도시를 찾거나 실시간 날씨 지도를 살펴보세요.</p>
      </div>
    </header>

    <nav class="section-tabs" aria-label="날씨 탐색 메뉴">
      <RouterLink v-for="tab in exploreTabs" :key="tab.label" :to="tab.to">
        <strong>{{ tab.label }}</strong>
        <span>{{ tab.description }}</span>
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
