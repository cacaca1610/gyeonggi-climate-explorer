/**
 * 경기기후 플랫폼 API 클라이언트
 * https://climate.gg.go.kr/ols/api/geoserver/wfs
 */

import { convertToWGS84 } from '@/utils/coordinates';

const API_BASE_URL = 'https://climate.gg.go.kr/ols/api/geoserver/wfs';
const API_KEY = process.env.NEXT_PUBLIC_GG_CLIMATE_API_KEY || '';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, any>;
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  totalFeatures: number;
  features: GeoJSONFeature[];
}

export interface Park {
  id: string;
  name: string;
  area: number;
  location: string;
  category: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface CulturalProperty {
  id: string;
  name: string;
  type: string;
  location: string;
  coordinates: [number, number];
}

export interface Shelter {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: [number, number];
}

/**
 * WFS API 호출
 */
async function fetchWFS(
  typeName: string,
  maxFeatures: number = 100,
  filter?: string
): Promise<GeoJSONResponse> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName,
    outputFormat: 'application/json',
    maxFeatures: maxFeatures.toString(),
  });

  if (filter) {
    params.append('CQL_FILTER', filter);
  }

  const url = `${API_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ API 응답 에러 (${typeName}): ${response.status}`);
      return {
        type: 'FeatureCollection',
        totalFeatures: 0,
        features: []
      };
    }

    const contentType = response.headers.get('content-type');

    // XML 응답이면 빈 결과 반환
    if (contentType?.includes('xml')) {
      console.warn(`⚠️ ${typeName}: API가 XML을 반환했습니다. 레이어를 확인하세요.`);
      return {
        type: 'FeatureCollection',
        totalFeatures: 0,
        features: []
      };
    }

    const data = await response.json();
    console.log(`✅ ${typeName} 데이터 로드 성공:`, data.totalFeatures || 0, '개');
    return data;
  } catch (error) {
    console.warn(`⚠️ 경기기후 API 호출 실패 (${typeName}):`, error instanceof Error ? error.message : error);
    // 에러 시 빈 결과 반환
    return {
      type: 'FeatureCollection',
      totalFeatures: 0,
      features: []
    };
  }
}

/**
 * 공원 데이터 조회
 */
export async function getParks(
  maxFeatures: number = 50,
  cityFilter?: string
): Promise<Park[]> {
  try {
    // API 필터가 작동하지 않으므로 더 많이 가져와서 클라이언트에서 필터링
    const fetchCount = cityFilter ? Math.min(maxFeatures * 50, 5000) : maxFeatures;
    console.log(`🌳 공원 API 호출: ${fetchCount}개 요청, 필터: ${cityFilter}`);
    const data = await fetchWFS('spggcee:park', fetchCount);
    console.log(`🌳 공원 API 응답: ${data.features.length}개`);

    let parks = data.features
      .filter(feature => feature.geometry && feature.geometry.coordinates) // geometry 없는 데이터 제외
      .map((feature, index) => {
        const props = feature.properties;
        const coords = getCenterCoordinates(feature.geometry);

        return {
          id: props.uid || `park-${index}`,
          name: props.sclsf_nm || props.mclsf_nm || '공원',
          area: props.biotop_area || 0,
          location: props.sgg_nm || '',
          category: props.lclsf_nm || '공원',
          coordinates: coords,
        };
      });

    console.log(`🌳 geometry 필터 후: ${parks.length}개`);

    // 클라이언트 사이드 필터링
    if (cityFilter) {
      const cityName = cityFilter.split(' ')[0];
      parks = parks.filter(park => park.location.includes(cityName));
      console.log(`🌳 도시 필터(${cityName}) 후: ${parks.length}개`);
    }

    // maxFeatures만큼만 반환
    const result = parks.slice(0, maxFeatures);
    console.log(`🌳 최종 반환: ${result.length}개`);
    return result;
  } catch (error) {
    console.error('공원 데이터 조회 실패:', error);
    return [];
  }
}

/**
 * 문화재 데이터 조회
 */
export async function getCulturalProperties(
  maxFeatures: number = 50,
  cityFilter?: string
): Promise<CulturalProperty[]> {
  try {
    let filter: string | undefined;

    if (cityFilter) {
      const cityName = cityFilter.split(' ')[0];
      filter = `sgg_nm LIKE '%${cityName}%'`;
    }

    const data = await fetchWFS('cultural_property', maxFeatures, filter);

    return data.features
      .filter(feature => feature.geometry && feature.geometry.coordinates) // geometry 없는 데이터 제외
      .map((feature, index) => {
        const props = feature.properties;
        const coords = getCenterCoordinates(feature.geometry);

        return {
          id: props.uid || `cultural-${index}`,
          name: props.name || '문화재',
          type: props.type || '문화재',
          location: props.sgg_nm || '',
          coordinates: coords,
        };
      });
  } catch (error) {
    console.error('문화재 데이터 조회 실패:', error);
    return [];
  }
}

/**
 * 침수위험 데이터 조회
 */
export async function getFloodRiskData(
  cityFilter?: string
): Promise<GeoJSONResponse | null> {
  try {
    let filter: string | undefined;

    if (cityFilter) {
      const cityName = cityFilter.split(' ')[0];
      filter = `sgg_nm LIKE '%${cityName}%'`;
    }

    return await fetchWFS('flood_risk_map', 100, filter);
  } catch (error) {
    console.error('침수위험 데이터 조회 실패:', error);
    return null;
  }
}

/**
 * 비오톱 데이터 조회
 */
export async function getBiotopData(
  cityFilter?: string
): Promise<GeoJSONResponse | null> {
  try {
    let filter: string | undefined;

    if (cityFilter) {
      const cityName = cityFilter.split(' ')[0];
      filter = `sgg_nm LIKE '%${cityName}%'`;
    }

    return await fetchWFS('biotop_type_evl_5grd', 100, filter);
  } catch (error) {
    console.error('비오톱 데이터 조회 실패:', error);
    return null;
  }
}

/**
 * Geometry에서 중심 좌표 추출 (EPSG:5186 → WGS84 변환)
 */
function getCenterCoordinates(geometry: any): [number, number] {
  // geometry가 null이거나 없는 경우 기본값 반환
  if (!geometry || !geometry.type || !geometry.coordinates) {
    console.warn('⚠️ Invalid geometry:', geometry);
    return [127.0286, 37.2636]; // 경기도 중심 (수원시)
  }

  let x: number, y: number;

  try {
    if (geometry.type === 'Point') {
      [x, y] = geometry.coordinates;
    } else if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0] as number[][];
      if (!coords || coords.length === 0) {
        return [127.0286, 37.2636];
      }
      const sum = coords.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );
      x = sum[0] / coords.length;
      y = sum[1] / coords.length;
    } else if (geometry.type === 'MultiPolygon') {
      const firstPolygon = geometry.coordinates[0][0] as number[][];
      if (!firstPolygon || firstPolygon.length === 0) {
        return [127.0286, 37.2636];
      }
      const sum = firstPolygon.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );
      x = sum[0] / firstPolygon.length;
      y = sum[1] / firstPolygon.length;
    } else {
      // 기본값: 경기도 중심 (수원시) - 이미 WGS84
      return [127.0286, 37.2636];
    }

    // EPSG:5186 → WGS84 변환
    return convertToWGS84(x, y);
  } catch (error) {
    console.warn('⚠️ Error processing geometry:', error);
    return [127.0286, 37.2636];
  }
}

/**
 * 대피시설 데이터 조회 (API)
 */
export async function getSheltersFromAPI(
  maxFeatures: number = 50,
  cityFilter?: string
): Promise<Shelter[]> {
  try {
    // API 필터가 작동하지 않으므로 더 많이 가져와서 클라이언트에서 필터링
    const fetchCount = cityFilter ? Math.min(maxFeatures * 100, 5000) : maxFeatures;
    console.log(`🏠 대피소 API 호출: ${fetchCount}개 요청, 필터: ${cityFilter}`);
    const data = await fetchWFS('spggcee:cvldfs_evcfclt', fetchCount);
    console.log(`🏠 대피소 API 응답: ${data.features.length}개`);

    let shelters = data.features
      .filter(feature => feature.geometry && feature.geometry.coordinates) // geometry 없는 데이터 제외
      .map((feature, index) => {
        const props = feature.properties;
        const coords = getCenterCoordinates(feature.geometry);

        return {
          id: props.mng_no || `shelter-${index}`,
          name: props.fclt_nm_bldg_nm || props.bplc_nm || '대피시설',
          type: props.fclt_se_nm || '민방위시설',
          address: props.road_nm_addr || props.lotno_addr || '',
          coordinates: coords,
        };
      });

    console.log(`🏠 geometry 필터 후: ${shelters.length}개`);

    // 클라이언트 사이드 필터링
    if (cityFilter) {
      const cityName = cityFilter.split(' ')[0];
      shelters = shelters.filter(shelter =>
        shelter.address.includes(cityName)
      );
      console.log(`🏠 도시 필터(${cityName}) 후: ${shelters.length}개`);
    }

    // maxFeatures만큼만 반환
    const result = shelters.slice(0, maxFeatures);
    console.log(`🏠 최종 반환: ${result.length}개`);
    return result;
  } catch (error) {
    console.error('대피시설 데이터 조회 실패:', error);
    return [];
  }
}

/**
 * 무더위쉼터 데이터 조회 (더미 데이터 - fallback용)
 */
export function getShelters(cityName: string): Shelter[] {
  // 경기도 31개 시군구 대피소 좌표
  const sheltersByCity: Record<string, Shelter[]> = {
    '수원시': [
      { id: 's-1', name: '수원시청 무더위쉼터', type: '시청', address: '수원시 팔달구', coordinates: [127.0286, 37.2636] },
      { id: 's-2', name: '장안구 무더위쉼터', type: '구청', address: '수원시 장안구', coordinates: [127.009, 37.300] },
      { id: 's-3', name: '영통구 무더위쉼터', type: '구청', address: '수원시 영통구', coordinates: [127.071, 37.257] },
    ],
    '성남시': [
      { id: 's-4', name: '성남시청 무더위쉼터', type: '시청', address: '성남시 중원구', coordinates: [127.1388, 37.4201] },
      { id: 's-5', name: '분당구 무더위쉼터', type: '구청', address: '성남시 분당구', coordinates: [127.122, 37.382] },
      { id: 's-6', name: '수정구 무더위쉼터', type: '구청', address: '성남시 수정구', coordinates: [127.147, 37.445] },
    ],
    '고양시': [
      { id: 's-7', name: '고양시청 무더위쉼터', type: '시청', address: '고양시 덕양구', coordinates: [126.8356, 37.6584] },
      { id: 's-8', name: '일산동구 무더위쉼터', type: '구청', address: '고양시 일산동구', coordinates: [126.773, 37.699] },
      { id: 's-9', name: '일산서구 무더위쉼터', type: '구청', address: '고양시 일산서구', coordinates: [126.768, 37.678] },
    ],
    '용인시': [
      { id: 's-10', name: '용인시청 무더위쉼터', type: '시청', address: '용인시 처인구', coordinates: [127.1778, 37.2411] },
      { id: 's-11', name: '기흥구 무더위쉼터', type: '구청', address: '용인시 기흥구', coordinates: [127.117, 37.276] },
      { id: 's-12', name: '수지구 무더위쉼터', type: '구청', address: '용인시 수지구', coordinates: [127.098, 37.326] },
    ],
    '부천시': [
      { id: 's-13', name: '부천시청 무더위쉼터', type: '시청', address: '부천시 원미구', coordinates: [126.7832, 37.5034] },
      { id: 's-14', name: '소사구 무더위쉼터', type: '구청', address: '부천시 소사구', coordinates: [126.792, 37.487] },
    ],
    '안산시': [
      { id: 's-15', name: '안산시청 무더위쉼터', type: '시청', address: '안산시 단원구', coordinates: [126.8312, 37.3219] },
      { id: 's-16', name: '상록구 무더위쉼터', type: '구청', address: '안산시 상록구', coordinates: [126.849, 37.299] },
    ],
    '안양시': [
      { id: 's-17', name: '안양시청 무더위쉼터', type: '시청', address: '안양시 만안구', coordinates: [126.9568, 37.3943] },
      { id: 's-18', name: '동안구 무더위쉼터', type: '구청', address: '안양시 동안구', coordinates: [126.951, 37.390] },
    ],
    '남양주시': [
      { id: 's-19', name: '남양주시청 무더위쉼터', type: '시청', address: '남양주시', coordinates: [127.2164, 37.6362] },
      { id: 's-20', name: '다산동 주민센터', type: '주민센터', address: '남양주시 다산동', coordinates: [127.155, 37.665] },
    ],
    '화성시': [
      { id: 's-21', name: '화성시청 무더위쉼터', type: '시청', address: '화성시', coordinates: [126.8311, 37.1995] },
      { id: 's-22', name: '동탄 복합센터', type: '복합센터', address: '화성시 동탄', coordinates: [127.073, 37.200] },
    ],
    '평택시': [
      { id: 's-23', name: '평택시청 무더위쉼터', type: '시청', address: '평택시', coordinates: [127.1127, 36.9921] },
      { id: 's-24', name: '송탄 주민센터', type: '주민센터', address: '평택시 송탄', coordinates: [127.074, 37.074] },
    ],
    '의정부시': [
      { id: 's-25', name: '의정부시청 무더위쉼터', type: '시청', address: '의정부시', coordinates: [127.0478, 37.7381] },
      { id: 's-26', name: '가능동 주민센터', type: '주민센터', address: '의정부시 가능동', coordinates: [127.062, 37.737] },
    ],
    '시흥시': [
      { id: 's-27', name: '시흥시청 무더위쉼터', type: '시청', address: '시흥시', coordinates: [126.8029, 37.3799] },
      { id: 's-28', name: '정왕동 주민센터', type: '주민센터', address: '시흥시 정왕동', coordinates: [126.735, 37.350] },
    ],
    '파주시': [
      { id: 's-29', name: '파주시청 무더위쉼터', type: '시청', address: '파주시', coordinates: [126.7800, 37.7599] },
      { id: 's-30', name: '운정동 주민센터', type: '주민센터', address: '파주시 운정동', coordinates: [126.747, 37.746] },
    ],
    '광명시': [
      { id: 's-31', name: '광명시청 무더위쉼터', type: '시청', address: '광명시', coordinates: [126.8644, 37.4784] },
    ],
    '김포시': [
      { id: 's-32', name: '김포시청 무더위쉼터', type: '시청', address: '김포시', coordinates: [126.7157, 37.6151] },
    ],
    '군포시': [
      { id: 's-33', name: '군포시청 무더위쉼터', type: '시청', address: '군포시', coordinates: [126.9352, 37.3617] },
    ],
    '광주시': [
      { id: 's-34', name: '광주시청 무더위쉼터', type: '시청', address: '광주시', coordinates: [127.2558, 37.4296] },
    ],
    '이천시': [
      { id: 's-35', name: '이천시청 무더위쉼터', type: '시청', address: '이천시', coordinates: [127.4350, 37.2722] },
    ],
    '양주시': [
      { id: 's-36', name: '양주시청 무더위쉼터', type: '시청', address: '양주시', coordinates: [127.0453, 37.7853] },
    ],
    '오산시': [
      { id: 's-37', name: '오산시청 무더위쉼터', type: '시청', address: '오산시', coordinates: [127.0773, 37.1499] },
    ],
    '구리시': [
      { id: 's-38', name: '구리시청 무더위쉼터', type: '시청', address: '구리시', coordinates: [127.1295, 37.5943] },
    ],
    '안성시': [
      { id: 's-39', name: '안성시청 무더위쉼터', type: '시청', address: '안성시', coordinates: [127.2797, 37.0079] },
    ],
    '포천시': [
      { id: 's-40', name: '포천시청 무더위쉼터', type: '시청', address: '포천시', coordinates: [127.2004, 37.8948] },
    ],
    '의왕시': [
      { id: 's-41', name: '의왕시청 무더위쉼터', type: '시청', address: '의왕시', coordinates: [126.9683, 37.3449] },
    ],
    '하남시': [
      { id: 's-42', name: '하남시청 무더위쉼터', type: '시청', address: '하남시', coordinates: [127.2149, 37.5391] },
    ],
    '여주시': [
      { id: 's-43', name: '여주시청 무더위쉼터', type: '시청', address: '여주시', coordinates: [127.6372, 37.2983] },
    ],
    '양평군': [
      { id: 's-44', name: '양평군청 무더위쉼터', type: '군청', address: '양평군', coordinates: [127.4875, 37.4910] },
    ],
    '동두천시': [
      { id: 's-45', name: '동두천시청 무더위쉼터', type: '시청', address: '동두천시', coordinates: [127.0604, 37.9034] },
    ],
    '과천시': [
      { id: 's-46', name: '과천시청 무더위쉼터', type: '시청', address: '과천시', coordinates: [126.9877, 37.4292] },
    ],
    '가평군': [
      { id: 's-47', name: '가평군청 무더위쉼터', type: '군청', address: '가평군', coordinates: [127.5094, 37.8314] },
    ],
    '연천군': [
      { id: 's-48', name: '연천군청 무더위쉼터', type: '군청', address: '연천군', coordinates: [127.0747, 38.0961] },
    ],
  };

  return sheltersByCity[cityName] || [];
}

/**
 * 시군구별 통계 데이터
 */
export async function getCityStats(cityName: string) {
  try {
    // 최대 100개씩 가져와서 통계 산출 (너무 많으면 느려짐)
    const [parks, shelters] = await Promise.all([
      getParks(100, cityName),
      getSheltersFromAPI(100, cityName),
    ]);

    return {
      parkCount: parks.length,
      shelterCount: shelters.length,
      totalGreenArea: parks.reduce((sum, p) => sum + p.area, 0),
    };
  } catch (error) {
    console.error('통계 데이터 조회 실패:', error);
    return {
      parkCount: 0,
      shelterCount: 0,
      totalGreenArea: 0,
    };
  }
}
