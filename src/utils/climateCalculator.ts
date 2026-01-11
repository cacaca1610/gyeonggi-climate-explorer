import {
  fetchParkData,
  fetchGreenArea,
  fetchFloodRiskMap,
  fetchBiotopData,
  extractCityName,
  GeoJSONResponse,
} from './apiClient';
import { ClimateGrade } from '@/data/climateGrades';

/**
 * API 데이터를 기반으로 실제 기후 등급 계산
 */
export const calculateClimateGradeFromAPI = async (
  location: string
): Promise<ClimateGrade | null> => {
  try {
    const cityName = extractCityName(location);

    // 병렬로 모든 데이터 가져오기
    const [parkData, greenData, floodData, biotopData] = await Promise.all([
      fetchParkData(cityName),
      fetchGreenArea(cityName),
      fetchFloodRiskMap(cityName),
      fetchBiotopData(cityName),
    ]);

    // 각 요인별 점수 계산
    const heatScore = calculateHeatRisk(parkData, greenData);
    const floodScore = calculateFloodRisk(floodData);
    const landslideScore = calculateLandslideRisk(biotopData);
    const carbonScore = calculateCarbonRisk(parkData, greenData);
    const greenScore = calculateGreenLevel(parkData, greenData, biotopData);

    return {
      location,
      heat: heatScore,
      flood: floodScore,
      landslide: landslideScore,
      carbon: carbonScore,
      green: greenScore,
    };
  } catch (error) {
    console.error('기후 등급 계산 실패:', error);
    return null;
  }
};

/**
 * 폭염 위험도 계산 (1-10)
 * 공원과 녹지가 많을수록 낮은 점수 (안전)
 */
const calculateHeatRisk = (
  parkData: GeoJSONResponse | null,
  greenData: GeoJSONResponse | null
): number => {
  if (!parkData && !greenData) return 5; // 기본값

  const parkCount = parkData?.features.length || 0;
  const greenCount = greenData?.features.length || 0;

  // 공원 + 녹지 총 면적 계산
  let totalArea = 0;

  if (parkData) {
    parkData.features.forEach((feature) => {
      const area = feature.properties?.biotop_area || feature.properties?.area || 0;
      totalArea += area;
    });
  }

  if (greenData) {
    greenData.features.forEach((feature) => {
      const area = feature.properties?.area || 0;
      totalArea += area;
    });
  }

  // 면적 기반 점수 계산 (면적이 클수록 낮은 위험도)
  // 100만㎡ 이상 = 1점 (매우 안전)
  // 50만㎡ = 3점
  // 10만㎡ = 5점
  // 5만㎡ = 7점
  // 1만㎡ 이하 = 9점
  if (totalArea >= 1000000) return 1;
  if (totalArea >= 500000) return 3;
  if (totalArea >= 100000) return 5;
  if (totalArea >= 50000) return 7;
  return 9;
};

/**
 * 홍수 위험도 계산 (1-10)
 * 침수위험지도 데이터 기반
 */
const calculateFloodRisk = (floodData: GeoJSONResponse | null): number => {
  if (!floodData) return 5; // 기본값

  const floodFeatures = floodData.features;
  if (floodFeatures.length === 0) return 2; // 침수 위험 지역 없음 = 안전

  // 침수 위험도별 집계
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  floodFeatures.forEach((feature) => {
    const riskLevel = feature.properties?.risk_level || feature.properties?.grade || '';

    if (riskLevel.includes('높음') || riskLevel.includes('high') || riskLevel.includes('3')) {
      highRiskCount++;
    } else if (riskLevel.includes('보통') || riskLevel.includes('medium') || riskLevel.includes('2')) {
      mediumRiskCount++;
    } else {
      lowRiskCount++;
    }
  });

  // 가중 평균으로 최종 점수 계산
  if (highRiskCount > 10) return 9;
  if (highRiskCount > 5) return 7;
  if (mediumRiskCount > 10) return 6;
  if (mediumRiskCount > 5) return 4;
  return 2;
};

/**
 * 산사태 위험도 계산 (1-10)
 * 비오톱 데이터 기반 (경사도, 토양 상태 등)
 */
const calculateLandslideRisk = (biotopData: GeoJSONResponse | null): number => {
  if (!biotopData) return 5; // 기본값

  const biotopFeatures = biotopData.features;
  if (biotopFeatures.length === 0) return 3; // 평지로 간주

  // 비오톱 등급 분석
  let highGradeCount = 0; // 1-2등급 (생태적으로 우수 = 산림 많음 = 산사태 가능성)
  let lowGradeCount = 0; // 4-5등급 (도시화 = 평지 많음)

  biotopFeatures.forEach((feature) => {
    const grade = feature.properties?.evl_grd || feature.properties?.grade || 3;

    if (grade <= 2) {
      highGradeCount++;
    } else if (grade >= 4) {
      lowGradeCount++;
    }
  });

  // 산림 지역이 많으면 산사태 위험 증가
  const totalFeatures = biotopFeatures.length;
  const highGradeRatio = highGradeCount / totalFeatures;

  if (highGradeRatio > 0.6) return 7; // 산림 60% 이상
  if (highGradeRatio > 0.4) return 5; // 산림 40% 이상
  if (highGradeRatio > 0.2) return 3; // 산림 20% 이상
  return 2; // 도시화된 평지
};

/**
 * 탄소배출 위험도 계산 (1-10)
 * 녹지와 공원 비율로 추정 (탄소 흡수 능력)
 */
const calculateCarbonRisk = (
  parkData: GeoJSONResponse | null,
  greenData: GeoJSONResponse | null
): number => {
  if (!parkData && !greenData) return 7; // 기본값 (높은 편)

  const totalFeatures = (parkData?.features.length || 0) + (greenData?.features.length || 0);

  // 녹지 수가 많을수록 탄소 흡수 능력이 높음 = 낮은 위험도
  if (totalFeatures >= 100) return 2; // 매우 많은 녹지
  if (totalFeatures >= 50) return 4;
  if (totalFeatures >= 20) return 6;
  return 8; // 녹지 부족
};

/**
 * 녹지 수준 계산 (1-10, 높을수록 녹지가 많음)
 * 공원, 녹지지역, 비오톱 종합
 */
const calculateGreenLevel = (
  parkData: GeoJSONResponse | null,
  greenData: GeoJSONResponse | null,
  biotopData: GeoJSONResponse | null
): number => {
  const parkCount = parkData?.features.length || 0;
  const greenCount = greenData?.features.length || 0;
  const biotopCount = biotopData?.features.length || 0;

  const totalGreenSpaces = parkCount + greenCount + biotopCount;

  // 총 녹지 공간 수에 따라 점수 부여
  if (totalGreenSpaces >= 150) return 9; // 매우 풍부
  if (totalGreenSpaces >= 100) return 8;
  if (totalGreenSpaces >= 70) return 7;
  if (totalGreenSpaces >= 50) return 6;
  if (totalGreenSpaces >= 30) return 5;
  if (totalGreenSpaces >= 20) return 4;
  if (totalGreenSpaces >= 10) return 3;
  return 2; // 녹지 매우 부족
};

/**
 * API 데이터 캐싱 (동일한 지역 재조회 방지)
 */
const climateCache = new Map<string, ClimateGrade>();

export const getClimateGradeWithCache = async (
  location: string
): Promise<ClimateGrade | null> => {
  // 캐시 확인
  if (climateCache.has(location)) {
    return climateCache.get(location) || null;
  }

  // API 호출하여 계산
  const grade = await calculateClimateGradeFromAPI(location);

  if (grade) {
    climateCache.set(location, grade);
  }

  return grade;
};
