import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // 현재 온도 단위: PDF 실습 기준 값
  const unit = ref('celsius')

  // getter 역할
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '°C' : '°F'
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

  return {
    unit,
    unitSymbol,
    convertTemperature,
    toggleUnit,
  }
})
