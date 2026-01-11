/**
 * 좌표계 변환 유틸리티
 * EPSG:5186 (한국 중부원점) ↔ EPSG:4326 (WGS84)
 */

import proj4 from 'proj4';

// EPSG:5186 정의 (한국 중부원점)
proj4.defs(
  'EPSG:5186',
  '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs'
);

// EPSG:4326 (WGS84) - Leaflet 기본 좌표계
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

/**
 * EPSG:5186 → EPSG:4326 변환
 * @param x - 동쪽 좌표 (m)
 * @param y - 북쪽 좌표 (m)
 * @returns [경도, 위도]
 */
export function convertToWGS84(x: number, y: number): [number, number] {
  try {
    const [lng, lat] = proj4('EPSG:5186', 'EPSG:4326', [x, y]);
    return [lng, lat];
  } catch (error) {
    console.error('좌표 변환 실패:', error);
    // 기본값: 수원시
    return [127.0286, 37.2636];
  }
}

/**
 * EPSG:4326 → EPSG:5186 변환
 * @param lng - 경도
 * @param lat - 위도
 * @returns [x, y] (m)
 */
export function convertToEPSG5186(lng: number, lat: number): [number, number] {
  try {
    const [x, y] = proj4('EPSG:4326', 'EPSG:5186', [lng, lat]);
    return [x, y];
  } catch (error) {
    console.error('좌표 변환 실패:', error);
    return [200000, 600000];
  }
}

/**
 * 경기도 주요 도시 좌표 (WGS84)
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  수원시: [127.0286, 37.2636],
  성남시: [127.1388, 37.4201],
  고양시: [126.8356, 37.6584],
  용인시: [127.1778, 37.2411],
  부천시: [126.7832, 37.5034],
  안산시: [126.8312, 37.3219],
  안양시: [126.9568, 37.3943],
  남양주시: [127.2164, 37.6362],
  화성시: [126.8311, 37.1995],
  평택시: [127.1127, 36.9921],
  의정부시: [127.0478, 37.7381],
  시흥시: [126.8029, 37.3799],
  파주시: [126.7800, 37.7599],
  광명시: [126.8644, 37.4784],
  김포시: [126.7157, 37.6151],
  군포시: [126.9352, 37.3617],
  광주시: [127.2558, 37.4296],
  이천시: [127.4350, 37.2722],
  양주시: [127.0453, 37.7853],
  오산시: [127.0773, 37.1499],
  구리시: [127.1295, 37.5943],
  안성시: [127.2797, 37.0079],
  포천시: [127.2004, 37.8948],
  의왕시: [126.9683, 37.3449],
  하남시: [127.2149, 37.5391],
  여주시: [127.6372, 37.2983],
  양평군: [127.4875, 37.4910],
  동두천시: [127.0604, 37.9034],
  과천시: [126.9877, 37.4292],
  가평군: [127.5094, 37.8314],
  연천군: [127.0747, 38.0961],
};

/**
 * 도시 이름으로 좌표 가져오기
 */
export function getCityCoordinates(cityName: string): [number, number] {
  // 정확한 매칭 시도
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }

  // 부분 매칭 시도 (예: "수원시 장안구" → "수원시")
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityName.includes(city)) {
      return coords;
    }
  }

  // 기본값: 경기도 중심 (수원시)
  return [127.0286, 37.2636];
}
