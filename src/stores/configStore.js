import { useColorMode, useLocalStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'weather-display-theme'
const UNIT_STORAGE_KEY = 'weather-temperature-unit'
const AVAILABLE_THEMES = ['system', 'light', 'dark']

const migrateStoredTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'system') {
    localStorage.setItem(THEME_STORAGE_KEY, 'auto')
  } else if (storedTheme && !['auto', 'light', 'dark'].includes(storedTheme)) {
    localStorage.removeItem(THEME_STORAGE_KEY)
  }
}

export const useConfigStore = defineStore('config', () => {
  migrateStoredTheme()

  // VueUse: 현재 온도 단위를 localStorage와 자동 동기화
  const unit = useLocalStorage(UNIT_STORAGE_KEY, 'celsius')

  if (!['celsius', 'fahrenheit'].includes(unit.value)) {
    unit.value = 'celsius'
  }

  // VueUse: 시스템 테마 감지, HTML data-theme 반영, 저장을 한 번에 처리
  const colorMode = useColorMode({
    selector: 'html',
    attribute: 'data-theme',
    initialValue: 'auto',
    storageKey: THEME_STORAGE_KEY,
  })

  // 기존 컴포넌트 API는 system/light/dark 형태로 그대로 유지
  const theme = computed({
    get: () => (colorMode.store.value === 'auto' ? 'system' : colorMode.store.value),
    set: (newTheme) => {
      colorMode.store.value = newTheme === 'system' ? 'auto' : newTheme
    },
  })

  // getter 역할
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '°C' : '°F'
  })

  const resolvedTheme = computed(() => colorMode.state.value)

  // 섭씨 값을 현재 단위에 맞게 변환
  const convertTemperature = (celsius) => {
    if (unit.value === 'celsius') {
      return Math.round(celsius)
    }

    return Math.round((celsius * 9) / 5 + 32)
  }

  // action 역할
  const toggleUnit = () => {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  const setTheme = (newTheme) => {
    if (AVAILABLE_THEMES.includes(newTheme)) {
      theme.value = newTheme
    }
  }

  // watch 실습: 실제 테마가 바뀔 때 브라우저 UI 색상도 함께 갱신
  watch(
    resolvedTheme,
    (newResolvedTheme) => {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', newResolvedTheme === 'dark' ? '#000000' : '#ffffff')
    },
    { immediate: true },
  )

  return {
    unit,
    unitSymbol,
    theme,
    resolvedTheme,
    convertTemperature,
    toggleUnit,
    setTheme,
  }
})
