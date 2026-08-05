import { computed, ref } from 'vue'

import { searchKoreanRegions } from '@/api/locationApi.js'
import { createLocationFromKakao } from '@/stores/weatherStore.js'

const SUGGESTION_DEBOUNCE_MS = 400

// 카카오 지역 검색은 '서울'처럼 완성된 한글 두 글자 이상일 때만 허용
export const isValidLocationQuery = (value) => {
  const query = String(value ?? '').trim()
  const hasStandaloneJamo = /[ㄱ-ㅎㅏ-ㅣ]/.test(query)

  return query.length >= 2 && !hasStandaloneJamo
}

const getSuggestionErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return '카카오 REST API 키를 확인해 주세요.'
  }

  if (error.response?.status === 403) {
    return '카카오맵 API 사용 설정이 켜져 있는지 확인해 주세요.'
  }

  return '지역 검색 중 오류가 발생했습니다.'
}

// 카카오 지역 후보 조회를 도시 검색 화면과 도시 비교 화면이 함께 사용하기 위한 합성 함수
export const useLocationSearch = () => {
  const rawResults = ref([])
  const isSuggesting = ref(false)
  const hasRequested = ref(false)
  const errorMessage = ref('')

  // 늦게 도착한 이전 응답이 최신 후보를 덮어쓰지 않도록 요청 순번을 기록
  let requestSequence = 0
  let debounceTimerId

  // 행정구역만 남기고 좌표가 같은 후보는 한 번만 표시
  const suggestions = computed(() => {
    const locationMap = new Map()

    rawResults.value
      .filter((item) => item.address_type === 'REGION')
      .map(createLocationFromKakao)
      .forEach((location) => {
        locationMap.set(location.key, location)
      })

    return [...locationMap.values()]
  })

  const stopScheduledSearch = () => {
    clearTimeout(debounceTimerId)
  }

  // 진행 중인 조회를 무효화 (다른 흐름이 화면을 차지할 때 사용)
  const invalidate = () => {
    stopScheduledSearch()
    requestSequence += 1
    isSuggesting.value = false
  }

  const reset = () => {
    invalidate()
    rawResults.value = []
    hasRequested.value = false
    errorMessage.value = ''
  }

  const search = async (query) => {
    const normalizedQuery = String(query ?? '').trim()

    if (!isValidLocationQuery(normalizedQuery)) {
      return []
    }

    // 예약된 디바운스 조회가 뒤늦게 겹치지 않도록 먼저 취소
    stopScheduledSearch()

    const requestId = ++requestSequence
    isSuggesting.value = true
    hasRequested.value = false
    errorMessage.value = ''

    try {
      const response = await searchKoreanRegions(normalizedQuery)

      if (requestId !== requestSequence) {
        return []
      }

      rawResults.value = response.data.documents ?? []
      hasRequested.value = true

      return [...suggestions.value]
    } catch (error) {
      if (requestId !== requestSequence) {
        return []
      }

      rawResults.value = []
      hasRequested.value = true
      errorMessage.value = getSuggestionErrorMessage(error)

      return []
    } finally {
      if (requestId === requestSequence) {
        isSuggesting.value = false
      }
    }
  }

  // 입력이 멈춘 뒤에만 조회하여 타이핑 중 불필요한 요청을 줄임
  const scheduleSearch = (query) => {
    stopScheduledSearch()

    if (!isValidLocationQuery(query)) {
      return
    }

    debounceTimerId = window.setTimeout(() => {
      search(query)
    }, SUGGESTION_DEBOUNCE_MS)
  }

  return {
    suggestions,
    isSuggesting,
    hasRequested,
    errorMessage,
    search,
    scheduleSearch,
    stopScheduledSearch,
    invalidate,
    reset,
  }
}
