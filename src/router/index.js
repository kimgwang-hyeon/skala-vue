import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WeatherHomeView, // 기본 로딩
      meta: { title: '날씨 대시보드' },
    },
    {
      path: '/about',
      name: 'about',
      // 지연 로딩 (Lazy Loading)
      component: () => import('@/views/WeatherAboutView.vue'),
      meta: { title: '서비스 소개' },
    },
    {
      path: '/weather/:cityId',
      name: 'weather-detail',
      // 지연 로딩 (Lazy Loading)
      component: () => import('@/views/WeatherDetailView.vue'),
      meta: { title: '상세 날씨' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/WeatherFavoritesView.vue'),
      meta: { title: '즐겨찾기' },
    },
    {
      // 정의되지 않은 모든 경로는 NotFoundView로 연결 (Catch-all)
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '페이지를 찾을 수 없음' },
    },
  ],
  // 새 페이지 이동은 맨 위로, 뒤로가기는 이전 스크롤 위치로 이동
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    // 검색 query만 바뀔 때는 현재 위치를 유지
    return to.path !== from.path ? { top: 0 } : false
  },
})

// 각 라우트의 meta.title을 브라우저 탭 제목에 반영
router.afterEach((to) => {
  const pageTitle = to.meta.title || '날씨 대시보드'
  document.title = `${pageTitle} | SKALA Weather`
})

export default router
