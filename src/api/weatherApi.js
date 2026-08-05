import axios from 'axios'

// 응답이 오지 않을 때 로딩 상태에 갇히지 않도록 공통 제한 시간을 둠
const REQUEST_TIMEOUT = 5000

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: REQUEST_TIMEOUT,
})

const geocodingApi = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  timeout: REQUEST_TIMEOUT,
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
