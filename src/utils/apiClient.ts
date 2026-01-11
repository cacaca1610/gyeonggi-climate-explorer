const API_KEY = '4c58df36-82b2-40b2-b360-6450cca44b1e';
const BASE_URL = 'https://climate.gg.go.kr/ols/api/geoserver/wfs';

export interface GeoJSONFeature {
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface GeoJSONResponse {
  type: string;
  totalFeatures: number;
  features: GeoJSONFeature[];
}

/**
 * 경기기후 플랫폼 API 호출
 */
export const fetchClimateData = async (
  typeName: string,
  maxFeatures: number = 100,
  filter?: string
): Promise<GeoJSONResponse | null> => {
  // 여러 조합 시도 (버전 x 형식)
  const attempts = [
    { version: '2.0.0', format: 'application/json' },
    { version: '2.0.0', format: 'json' },
    { version: '1.1.0', format: 'application/json' },
    { version: '1.1.0', format: 'json' },
    { version: '1.0.0', format: 'application/json' },
  ];

  for (const { version, format } of attempts) {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        service: 'WFS',
        version,
        request: 'GetFeature',
        typeName,
        outputFormat: format,
        maxFeatures: maxFeatures.toString(),
      });

      if (filter) {
        params.append('CQL_FILTER', filter);
      }

      const url = `${BASE_URL}?${params.toString()}`;
      console.log(`[API 시도] v${version} format=${format}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.log(`[API] HTTP ${response.status} - 다음 시도`);
        continue;
      }

      const text = await response.text();

      // XML 응답이면 다음 시도
      if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
        console.log(`[API] XML 응답 - 다음 시도`);
        continue;
      }

      // JSON 파싱 시도
      const data = JSON.parse(text);
      console.log(`[API 성공] v${version} format=${format}, features=${data.features?.length || 0}`);
      return data;
    } catch (error) {
      console.log(`[API] 실패 - 다음 시도`);
      continue;
    }
  }

  // 모든 시도 실패 - 더미 데이터 사용
  console.warn('[API] 모든 시도 실패 - 더미 데이터로 대체');
  console.info('[참고] 현재 API가 JSON을 지원하지 않거나 레이어명이 잘못되었을 수 있습니다.');
  console.info('[해결] 앱은 더미 데이터로 정상 작동합니다.');
  return null;
};

/**
 * 공원 데이터 가져오기
 */
export const fetchParkData = async (cityName: string): Promise<GeoJSONResponse | null> => {
  const filter = `sgg_nm LIKE '%${cityName}%'`;
  return fetchClimateData('park', 100, filter);
};

/**
 * 문화재 데이터 가져오기
 */
export const fetchCulturalProperty = async (cityName: string): Promise<GeoJSONResponse | null> => {
  const filter = `sgg_nm LIKE '%${cityName}%'`;
  return fetchClimateData('cultural_property', 50, filter);
};

/**
 * 비오톱 (생태) 데이터 가져오기
 */
export const fetchBiotopData = async (cityName: string): Promise<GeoJSONResponse | null> => {
  const filter = `sgg_nm LIKE '%${cityName}%'`;
  return fetchClimateData('biotop_type_evl_5grd', 100, filter);
};

/**
 * 녹지지역 데이터 가져오기
 */
export const fetchGreenArea = async (cityName: string): Promise<GeoJSONResponse | null> => {
  const filter = `sgg_nm LIKE '%${cityName}%'`;
  return fetchClimateData('green_area', 100, filter);
};

/**
 * 침수위험지도 데이터 가져오기
 */
export const fetchFloodRiskMap = async (cityName: string): Promise<GeoJSONResponse | null> => {
  const filter = `sgg_nm LIKE '%${cityName}%'`;
  return fetchClimateData('flood_risk_map', 100, filter);
};

/**
 * 지역명에서 시군구명 추출
 * 예: "수원시 장안구 파장동" -> "수원시"
 */
export const extractCityName = (fullLocation: string): string => {
  const parts = fullLocation.split(' ');
  return parts[0] || '';
};
