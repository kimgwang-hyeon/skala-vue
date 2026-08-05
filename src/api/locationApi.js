import axios from 'axios'

const kakaoLocalApi = axios.create({
  baseURL: 'https://dapi.kakao.com/v2/local',
  headers: {
    Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
  },
})

// 입력한 지역명과 비슷한 대한민국 행정구역 및 주소 후보 조회
export const searchKoreanRegions = (query) => {
  return kakaoLocalApi.get('/search/address.json', {
    params: {
      query,
      analyze_type: 'similar',
      size: 10,
    },
  })
}
