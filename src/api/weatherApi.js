import axios from 'axios'

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
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
