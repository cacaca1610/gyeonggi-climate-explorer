export interface ClimateGrade {
  location: string;
  heat: number; // 폭염 등급 (1-10)
  flood: number; // 홍수 등급 (1-10)
  landslide: number; // 산사태 등급 (1-10)
  carbon: number; // 탄소 등급 (1-10)
  green: number; // 녹지 등급 (1-10, 높을수록 녹지 많음)
}

export const climateGrades: ClimateGrade[] = [
  // 수원시
  { location: '수원시 장안구 파장동', heat: 5, flood: 4, landslide: 2, carbon: 6, green: 7 },
  { location: '수원시 장안구 율천동', heat: 6, flood: 5, landslide: 3, carbon: 7, green: 6 },
  { location: '수원시 권선구 세류동', heat: 7, flood: 6, landslide: 2, carbon: 8, green: 5 },
  { location: '수원시 팔달구 인계동', heat: 8, flood: 4, landslide: 1, carbon: 9, green: 4 },
  { location: '수원시 영통구 영통동', heat: 6, flood: 5, landslide: 2, carbon: 7, green: 7 },

  // 성남시
  { location: '성남시 수정구 신흥동', heat: 7, flood: 5, landslide: 4, carbon: 8, green: 5 },
  { location: '성남시 중원구 성남동', heat: 8, flood: 6, landslide: 3, carbon: 9, green: 4 },
  { location: '성남시 분당구 분당동', heat: 5, flood: 4, landslide: 2, carbon: 6, green: 8 },
  { location: '성남시 분당구 수내동', heat: 4, flood: 3, landslide: 2, carbon: 5, green: 9 },

  // 용인시
  { location: '용인시 처인구 김량장동', heat: 4, flood: 5, landslide: 5, carbon: 5, green: 8 },
  { location: '용인시 기흥구 구갈동', heat: 6, flood: 4, landslide: 3, carbon: 7, green: 7 },
  { location: '용인시 기흥구 신갈동', heat: 7, flood: 5, landslide: 3, carbon: 8, green: 6 },
  { location: '용인시 수지구 풍덕천동', heat: 5, flood: 4, landslide: 3, carbon: 6, green: 8 },

  // 고양시
  { location: '고양시 덕양구 화정동', heat: 7, flood: 5, landslide: 2, carbon: 8, green: 6 },
  { location: '고양시 일산동구 백석동', heat: 6, flood: 4, landslide: 2, carbon: 7, green: 7 },
  { location: '고양시 일산서구 일산동', heat: 5, flood: 4, landslide: 2, carbon: 6, green: 8 },
];

// 문자열을 숫자로 변환하는 해시 함수
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 지역 이름 기반으로 등급 생성 (1-10 범위)
const generateGradeFromLocation = (location: string, seed: number): number => {
  const hash = hashString(location + seed);
  // 3-7 범위로 제한 (극단값 방지)
  return (hash % 5) + 3;
};

export const getClimateGrade = (location: string): ClimateGrade => {
  // 등록된 동네 찾기
  const found = climateGrades.find(grade => grade.location === location);

  // 등록되지 않은 동네는 지역명 기반으로 다양한 값 생성
  if (!found) {
    return {
      location,
      heat: generateGradeFromLocation(location, 1), // 폭염
      flood: generateGradeFromLocation(location, 2), // 홍수
      landslide: generateGradeFromLocation(location, 3), // 산사태
      carbon: generateGradeFromLocation(location, 4), // 탄소
      green: generateGradeFromLocation(location, 5), // 녹지
    };
  }

  return found;
};

export const getGradeLevel = (grade: number): { level: string; color: string; bgColor: string } => {
  if (grade >= 1 && grade <= 3) {
    return { level: '안전', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (grade >= 4 && grade <= 6) {
    return { level: '주의', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  } else {
    return { level: '위험', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
};
