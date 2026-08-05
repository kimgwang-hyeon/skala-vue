import axios from 'axios'

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
})

const geocodingApi = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
})

export const fetchCurrentWeather = ({ lat, lon }) => {
  return weatherApi.get('/weather', {
    params: {
      lat,
      lon,
      units: 'metric',
      lang: 'kr',
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    },
  })
}

// 같은 좌표의 5일 / 3시간 간격 예보 요청
export const fetchForecast = ({ lat, lon }) => {
  return weatherApi.get('/forecast', {
    params: {
      lat,
      lon,
      units: 'metric',
      lang: 'kr',
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    },
  })
}

// 대한민국 도시 이름을 좌표로 변환
export const searchKoreanCities = (query) => {
  return geocodingApi.get('/direct', {
    params: {
      q: `${query},KR`,
      limit: 5,
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    },
  })
}

// 브라우저 현재 좌표를 사람이 읽을 수 있는 도시명으로 변환
export const reverseGeocodeLocation = ({ lat, lon }) => {
  return geocodingApi.get('/reverse', {
    params: {
      lat,
      lon,
      limit: 1,
      appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
    },
  })
}
