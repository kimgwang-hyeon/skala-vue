<script setup>
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
</script>

<template>
  <div class="about-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">About / SKALA Weather</p>
        <h1>날씨를 탐색하는<br />Vue 학습 프로젝트</h1>
        <p class="page-description">
          학습한 Vue 기능을 실제 서비스 흐름 안에서 연결했습니다.
        </p>
      </div>
    </header>

    <BaseDashboardCard
      eyebrow="Technology"
      title="프로젝트 구성"
      description="하나의 날씨 서비스를 완성하며 데이터 흐름과 화면 전환을 연습합니다."
    >
      <div class="about-feature-grid">
        <article>
          <span>01</span>
          <strong>Vue 3</strong>
          <p>ref, computed, watch와 컴포넌트 Props·Emits·Slot을 활용합니다.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Vue Router</strong>
          <p>중첩 라우트, 동적 경로, 지연 로딩과 URL query를 적용했습니다.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Pinia</strong>
          <p>대시보드, 즐겨찾기, 단위와 테마 상태를 모든 페이지에서 공유합니다.</p>
        </article>
        <article>
          <span>04</span>
          <strong>Axios</strong>
          <p>OpenWeather API로 대한민국 도시와 실제 기상 정보를 조회합니다.</p>
        </article>
      </div>

      <template #footer>
        <div class="about-actions">
          <RouterLink class="button-primary" :to="{ name: 'home' }">
            대시보드로 이동
          </RouterLink>
          <RouterLink class="button-secondary" :to="{ name: 'search' }">
            도시 탐색하기
          </RouterLink>
        </div>
      </template>
    </BaseDashboardCard>
  </div>
</template>
