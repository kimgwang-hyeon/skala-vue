const RECENT_SEARCHES_KEY = 'weather-recent-searches'
const FAVORITE_CITY_IDS_KEY = 'weather-favorite-city-ids'

const readList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const writeList = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getRecentSearches = () => readList(RECENT_SEARCHES_KEY)

export const saveRecentSearches = (searches) => {
  writeList(RECENT_SEARCHES_KEY, searches)
}

export const getFavoriteCityIds = () => readList(FAVORITE_CITY_IDS_KEY).map(Number)

export const saveFavoriteCityIds = (cityIds) => {
  writeList(FAVORITE_CITY_IDS_KEY, cityIds)
}
