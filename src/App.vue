<script setup>
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import ThemeSwitcher from '@/components/exercise/ThemeSwitcher.vue'
import UnitToggler from '@/components/exercise/UnitToggler.vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navigationItems = [
  {
    label: '대시보드',
    to: { name: 'home' },
    activeRoutes: ['home'],
  },
  {
    label: '탐색',
    to: { name: 'search' },
    activeRoutes: ['search', 'weather-map'],
  },
  {
    label: '도시 비교',
    to: { name: 'weather-compare' },
    activeRoutes: ['weather-compare'],
  },
  {
    label: '즐겨찾기',
    to: { name: 'favorites' },
    activeRoutes: ['favorites'],
  },
]

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">본문으로 바로가기</a>

    <header class="site-header">
      <div class="site-header-inner">
        <RouterLink class="app-brand" :to="{ name: 'home' }" aria-label="SKALA Weather 홈">
          <span class="app-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="5" />
              <path d="M14 2.5v3M14 22.5v3M2.5 14h3M22.5 14h3M5.9 5.9 8 8M20 20l2.1 2.1M5.9 22.1 8 20M20 8l2.1-2.1" />
            </svg>
          </span>
          <span class="app-brand-copy">
            <strong>SKALA</strong>
            <span>Weather</span>
          </span>
        </RouterLink>

        <button
          type="button"
          class="mobile-menu-button"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="primary-navigation"
          :aria-label="isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <nav
          id="primary-navigation"
          class="primary-navigation"
          :class="{ 'is-open': isMobileMenuOpen }"
          aria-label="주요 메뉴"
        >
          <RouterLink
            v-for="item in navigationItems"
            :key="item.label"
            :to="item.to"
            :class="{ 'is-active': item.activeRoutes.includes(route.name) }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="header-actions" :class="{ 'is-open': isMobileMenuOpen }">
          <UnitToggler />
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <main id="main-content" class="app-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="site-footer-inner">
        <p>현재 날씨 데이터 제공: OpenWeather</p>
        <div>
          <RouterLink :to="{ name: 'about' }">서비스 소개</RouterLink>
          <span aria-hidden="true">·</span>
          <span>Vue 3 · Pinia · Vue Router</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
@import '@/assets/theme.css';
@import '@/assets/service.css';
</style>
