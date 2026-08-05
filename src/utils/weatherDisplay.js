const createDisplay = (label, emoji, tone) => {
  return { label, emoji, tone }
}

// OpenWeather의 번역 문구 대신 weather condition id로 일관된 한국어 표시
export const getWeatherDisplay = (weather = {}) => {
  const weatherId = Number(weather.id)

  if (weatherId >= 200 && weatherId <= 232) {
    return createDisplay('천둥번개', '⛈️', 'storm')
  }

  if (weatherId >= 300 && weatherId <= 321) {
    return createDisplay('이슬비', '🌦️', 'rain')
  }

  if (weatherId === 500) {
    return createDisplay('약한 비', '🌧️', 'rain')
  }

  if (weatherId === 501) {
    return createDisplay('비', '🌧️', 'rain')
  }

  if (weatherId >= 502 && weatherId <= 504) {
    return createDisplay('강한 비', '🌧️', 'rain')
  }

  if (weatherId === 511) {
    return createDisplay('어는 비', '🌨️', 'snow')
  }

  if (weatherId === 520) {
    return createDisplay('가벼운 소나기', '🌦️', 'rain')
  }

  if (weatherId === 521) {
    return createDisplay('소나기', '🌦️', 'rain')
  }

  if (weatherId >= 522 && weatherId <= 531) {
    return createDisplay('강한 소나기', '⛈️', 'rain')
  }

  if (weatherId === 600) {
    return createDisplay('약한 눈', '🌨️', 'snow')
  }

  if (weatherId === 601) {
    return createDisplay('눈', '❄️', 'snow')
  }

  if (weatherId === 602) {
    return createDisplay('폭설', '❄️', 'snow')
  }

  if (weatherId >= 611 && weatherId <= 616) {
    return createDisplay('진눈깨비', '🌨️', 'snow')
  }

  if (weatherId >= 620 && weatherId <= 622) {
    return createDisplay('소낙눈', '🌨️', 'snow')
  }

  if (weatherId === 701 || weatherId === 741) {
    return createDisplay('안개', '🌫️', 'mist')
  }

  if (weatherId === 711) {
    return createDisplay('연기', '🌫️', 'mist')
  }

  if (weatherId === 721) {
    return createDisplay('연무', '🌫️', 'mist')
  }

  if ([731, 751, 761].includes(weatherId)) {
    return createDisplay('먼지', '😷', 'mist')
  }

  if (weatherId === 762) {
    return createDisplay('화산재', '🌋', 'storm')
  }

  if (weatherId === 771) {
    return createDisplay('돌풍', '💨', 'storm')
  }

  if (weatherId === 781) {
    return createDisplay('토네이도', '🌪️', 'storm')
  }

  if (weatherId === 800) {
    return createDisplay('맑음', '☀️', 'clear')
  }

  if (weatherId === 801 || weatherId === 802) {
    return createDisplay('구름 조금', '🌤️', 'cloud')
  }

  if (weatherId === 803) {
    return createDisplay('구름 많음', '⛅', 'cloud')
  }

  if (weatherId === 804) {
    return createDisplay('흐림', '☁️', 'cloud')
  }

  return createDisplay(weather.description || '날씨 정보 없음', '🌡️', 'default')
}
