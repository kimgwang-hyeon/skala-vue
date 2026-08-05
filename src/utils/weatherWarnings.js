// 현재 날씨와 가까운 시간대 예보를 바탕으로 생활 참고 문구를 만듦
// 기상청 특보가 아니라 화면 학습용 안내이므로 기준을 단순하게 유지함
export const getWeatherWarnings = ({ currentWeather, forecastList = [] }) => {
  if (!currentWeather) {
    return []
  }

  const weatherItems = [currentWeather, ...forecastList]
  const temperatures = weatherItems.map((item) => item.main.temp)
  const windSpeeds = weatherItems.map((item) => item.wind?.speed ?? 0)
  const weatherIds = weatherItems.map((item) => item.weather?.[0]?.id ?? 0)
  const rainChances = forecastList.map((item) => item.pop ?? 0)
  const warnings = []

  if (Math.max(...temperatures) >= 33) {
    warnings.push({
      id: 'heat',
      level: 'danger',
      emoji: '🥵',
      title: '폭염 주의',
      message: '물을 자주 마시고, 한낮의 장시간 야외 활동은 피해 보세요.',
    })
  }

  if (Math.min(...temperatures) <= 0) {
    warnings.push({
      id: 'cold',
      level: 'cold',
      emoji: '🥶',
      title: '한파·결빙 주의',
      message: '보온에 신경 쓰고, 도로와 계단의 결빙 가능성을 확인하세요.',
    })
  }

  if (rainChances.length > 0 && Math.max(...rainChances) >= 0.7) {
    warnings.push({
      id: 'rain',
      level: 'rain',
      emoji: '☔',
      title: '우산 권장',
      message: '24시간 내 강수 확률이 높은 시간대가 있어요. 우산을 챙겨 보세요.',
    })
  }

  if (Math.max(...windSpeeds) >= 10) {
    warnings.push({
      id: 'wind',
      level: 'wind',
      emoji: '💨',
      title: '강풍 주의',
      message: '바람이 강할 수 있어요. 야외 시설물과 운전 시 횡풍에 주의하세요.',
    })
  }

  if (weatherIds.some((id) => id >= 200 && id < 300)) {
    warnings.push({
      id: 'thunderstorm',
      level: 'danger',
      emoji: '⚡',
      title: '뇌우 주의',
      message: '뇌우가 예상되는 시간에는 야외 활동을 줄이고 안전한 실내에 머무르세요.',
    })
  }

  if (weatherIds.some((id) => id >= 600 && id < 700)) {
    warnings.push({
      id: 'snow',
      level: 'cold',
      emoji: '❄️',
      title: '눈길 주의',
      message: '적설과 빙판길 가능성이 있어요. 대중교통 이용을 고려해 보세요.',
    })
  }

  return warnings
}
