<script setup>
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
</script>

<template>
  <BaseDashboardCard title="서비스 소개">
    <div class="about-content">
      <p>이 서비스는 Vue 3와 Vue Router를 활용한 날씨 대시보드 실습 프로젝트입니다.</p>

      <ul>
        <li>도시 이름 검색</li>
        <li>도시별 현재 날씨 확인</li>
        <li>동적 경로를 이용한 상세 페이지 이동</li>
      </ul>

      <RouterLink class="route-button" :to="{ name: 'home' }">
        대시보드 홈으로 이동
      </RouterLink>
    </div>
  </BaseDashboardCard>
</template>
