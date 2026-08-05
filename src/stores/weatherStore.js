import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { weatherMockList } from '@/data/weatherMock.js'

const DASHBOARD_STORAGE_KEY = 'weather-dashboard-locations'
const FAVORITES_STORAGE_KEY = 'weather-favorite-locations'
const KNOWN_LOCATIONS_STORAGE_KEY = 'weather-known-locations'
const LEGACY_FAVORITES_STORAGE_KEY = 'weather-favorite-city-ids'

// 좌표를 도시의 공통 식별자로 사용
export const createLocationKey = ({ lat, lon }) => {
  return `${Number(lat).toFixed(4)}_${Number(lon).toFixed(4)}`
}

const cloneLocation = (location) => {
  return {
    ...location,
    coord: { ...location.coord },
  }
}

const toDefaultLocation = (item) => {
  return {
    key: createLocationKey(item.coord),
    legacyId: item.id,
    name: item.name,
    state: item.state,
    country: item.country,
    coord: { ...item.coord },
  }
}

// Geocoding API 응답을 앱 전체에서 사용하는 도시 객체로 변환
export const createLocationFromGeocode = (item) => {
  const locationName = item.local_names?.ko ?? item.name
  const defaultLocation = DEFAULT_DASHBOARD_LOCATIONS.find((location) => {
    return location.name === locationName && location.country === item.country
  })

  // 기본 5개 도시는 Geocoding 좌표의 미세한 차이로 중복 등록되지 않도록 대표 좌표 재사용
  if (defaultLocation) {
    return {
      ...cloneLocation(defaultLocation),
      state: item.state ?? defaultLocation.state,
    }
  }

  const coord = {
    lat: item.lat,
    lon: item.lon,
  }

  return {
    key: createLocationKey(coord),
    name: locationName,
    state: item.state ?? '',
    country: item.country,
    coord,
  }
}

export const DEFAULT_DASHBOARD_LOCATIONS = weatherMockList.map(toDefaultLocation)

const readStoredList = (key) => {
  const storedValue = localStorage.getItem(key)

  if (storedValue === null) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

const mergeLocations = (...locationLists) => {
  const locationMap = new Map()

  locationLists.flat().forEach((location) => {
    if (location?.key) {
      locationMap.set(location.key, cloneLocation(location))
    }
  })

  return [...locationMap.values()]
}

export const useWeatherStore = defineStore('weather', () => {
  const storedDashboardLocations = readStoredList(DASHBOARD_STORAGE_KEY)
  const storedFavoriteLocations = readStoredList(FAVORITES_STORAGE_KEY)
  const storedKnownLocations = readStoredList(KNOWN_LOCATIONS_STORAGE_KEY) ?? []

  // 기존 숫자 ID 즐겨찾기는 새로운 좌표 기반 객체로 한 번 마이그레이션
  const legacyFavoriteIds = readStoredList(LEGACY_FAVORITES_STORAGE_KEY) ?? []
  const normalizedLegacyFavoriteIds = legacyFavoriteIds.map(Number)
  const migratedFavoriteLocations = DEFAULT_DASHBOARD_LOCATIONS.filter((location) => {
    return normalizedLegacyFavoriteIds.includes(Number(location.legacyId))
  })

  // 저장값이 없을 때만 기본 도시 5개를 넣으므로, 모두 삭제한 상태도 유지됨
  const dashboardCities = ref(
    storedDashboardLocations === null
      ? DEFAULT_DASHBOARD_LOCATIONS.map(cloneLocation)
      : storedDashboardLocations,
  )

  const favoriteCities = ref(
    storedFavoriteLocations === null ? migratedFavoriteLocations : storedFavoriteLocations,
  )

  // 검색한 도시도 기억하여 상세 URL을 새로고침해도 좌표를 다시 찾을 수 있게 함
  const knownCities = ref(
    mergeLocations(
      DEFAULT_DASHBOARD_LOCATIONS,
      dashboardCities.value,
      favoriteCities.value,
      storedKnownLocations,
    ),
  )

  const dashboardKeys = computed(() => {
    return new Set(dashboardCities.value.map((location) => location.key))
  })

  const favoriteKeys = computed(() => {
    return new Set(favoriteCities.value.map((location) => location.key))
  })

  const isInDashboard = (locationKey) => {
    return dashboardKeys.value.has(String(locationKey))
  }

  const isFavorite = (locationKey) => {
    return favoriteKeys.value.has(String(locationKey))
  }

  const findLocation = (identifier) => {
    const normalizedIdentifier = String(identifier)

    return knownCities.value.find((location) => {
      return (
        location.key === normalizedIdentifier ||
        String(location.legacyId) === normalizedIdentifier
      )
    })
  }

  const rememberLocations = (locations) => {
    knownCities.value = mergeLocations(knownCities.value, locations)
  }

  const addDashboardCity = (location) => {
    rememberLocations([location])

    if (!isInDashboard(location.key)) {
      dashboardCities.value = [...dashboardCities.value, cloneLocation(location)]
    }
  }

  const removeDashboardCity = (locationKey) => {
    dashboardCities.value = dashboardCities.value.filter((location) => {
      return location.key !== String(locationKey)
    })
  }

  const resetDashboardCities = () => {
    dashboardCities.value = DEFAULT_DASHBOARD_LOCATIONS.map(cloneLocation)
    rememberLocations(DEFAULT_DASHBOARD_LOCATIONS)
  }

  const toggleFavorite = (location) => {
    rememberLocations([location])

    if (isFavorite(location.key)) {
      favoriteCities.value = favoriteCities.value.filter((favorite) => {
        return favorite.key !== location.key
      })

      return false
    }

    favoriteCities.value = [...favoriteCities.value, cloneLocation(location)]
    return true
  }

  // watch 실습: 전역 상태가 변경될 때마다 브라우저 저장소에 자동 반영
  watch(
    dashboardCities,
    (locations) => {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(locations))
    },
    { deep: true },
  )

  watch(
    favoriteCities,
    (locations) => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(locations))
    },
    { deep: true },
  )

  watch(
    knownCities,
    (locations) => {
      localStorage.setItem(KNOWN_LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
    },
    { deep: true },
  )

  return {
    dashboardCities,
    favoriteCities,
    knownCities,
    dashboardKeys,
    favoriteKeys,
    isInDashboard,
    isFavorite,
    findLocation,
    rememberLocations,
    addDashboardCity,
    removeDashboardCity,
    resetDashboardCities,
    toggleFavorite,
  }
})
