const RECENT_SEARCHES_KEY = 'weather-recent-searches'
const API_RECENT_SEARCHES_KEY = 'weather-api-recent-searches'
const FAVORITE_CITY_IDS_KEY = 'weather-favorite-city-ids'

const readList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

// 사파리 프라이빗 모드나 용량 초과(QuotaExceededError)로 저장이 실패해도 앱은 계속 동작해야 함
const writeList = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패는 화면 동작에 영향이 없으므로 무시
  }
}

export const getRecentSearches = () => readList(RECENT_SEARCHES_KEY)

export const saveRecentSearches = (searches) => {
  writeList(RECENT_SEARCHES_KEY, searches)
}

// 메인 초성 검색과 API 도시 검색의 사용 목적이 달라 별도 목록으로 저장
export const getApiRecentSearches = () => readList(API_RECENT_SEARCHES_KEY)

export const saveApiRecentSearches = (searches) => {
  writeList(API_RECENT_SEARCHES_KEY, searches)
}

export const getFavoriteCityIds = () => readList(FAVORITE_CITY_IDS_KEY).map(Number)

export const saveFavoriteCityIds = (cityIds) => {
  writeList(FAVORITE_CITY_IDS_KEY, cityIds)
}
