import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'weather-display-theme'
const UNIT_STORAGE_KEY = 'weather-temperature-unit'
const AVAILABLE_THEMES = ['system', 'light', 'dark']

const getStoredTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return AVAILABLE_THEMES.includes(storedTheme) ? storedTheme : 'system'
}

const getStoredUnit = () => {
  const storedUnit = localStorage.getItem(UNIT_STORAGE_KEY)
  return storedUnit === 'fahrenheit' ? storedUnit : 'celsius'
}

export const useConfigStore = defineStore('config', () => {
  // 현재 온도 단위: PDF 실습 기준 값
  const unit = ref(getStoredUnit())
  const theme = ref(getStoredTheme())

  // 초기값과 변경 감지가 같은 MediaQueryList를 쓰도록 한 번만 생성
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const systemPrefersDark = ref(systemThemeQuery.matches)

  systemThemeQuery.addEventListener('change', (event) => {
    systemPrefersDark.value = event.matches
  })

  // getter 역할
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '°C' : '°F'
  })

  // system을 선택한 경우 운영체제 설정을 반영한 실제 테마를 계산
  const resolvedTheme = computed(() => {
    if (theme.value === 'system') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }

    return theme.value
  })

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

  // watch 실습: 사용자가 선택한 설정을 저장하고 실제 HTML 테마에 반영
  watch(
    [unit, theme, resolvedTheme],
    ([newUnit, newTheme, newResolvedTheme]) => {
      localStorage.setItem(UNIT_STORAGE_KEY, newUnit)
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      document.documentElement.dataset.theme = newResolvedTheme
      document.documentElement.style.colorScheme = newResolvedTheme
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
