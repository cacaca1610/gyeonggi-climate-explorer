import { ClimateGrade } from '@/data/climateGrades';

export interface ScoreResult {
  totalScore: number;
  grade: string;
  riskScore: number;
  factors: {
    heat: number;
    flood: number;
    landslide: number;
    carbon: number;
    greenLack: number;
  };
}

export const calculateScore = (climateGrade: ClimateGrade | null): ScoreResult => {
  if (!climateGrade) {
    return {
      totalScore: 50,
      grade: 'C',
      riskScore: 50,
      factors: {
        heat: 5,
        flood: 5,
        landslide: 5,
        carbon: 5,
        greenLack: 5,
      },
    };
  }

  // 각 요인의 위험 점수 계산 (1-10 등급을 0-10점으로 변환)
  const heatRisk = climateGrade.heat; // 폭염
  const floodRisk = climateGrade.flood; // 홍수
  const landslideRisk = climateGrade.landslide; // 산사태
  const carbonRisk = climateGrade.carbon; // 탄소
  const greenLackRisk = 11 - climateGrade.green; // 녹지 부족 (녹지가 많을수록 위험 낮음)

  // 가중치 적용 위험점수 계산
  const riskScore =
    heatRisk * 0.3 +
    floodRisk * 0.25 +
    landslideRisk * 0.15 +
    carbonRisk * 0.15 +
    greenLackRisk * 0.15;

  // 위험점수를 100점 만점으로 변환
  const riskScoreOut100 = (riskScore / 10) * 100;

  // 생존점수 = 100 - 위험점수
  const totalScore = Math.round(100 - riskScoreOut100);

  // 등급 계산
  let grade = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  else if (totalScore >= 50) grade = 'E';

  return {
    totalScore,
    grade,
    riskScore: Math.round(riskScoreOut100),
    factors: {
      heat: heatRisk,
      flood: floodRisk,
      landslide: landslideRisk,
      carbon: carbonRisk,
      greenLack: greenLackRisk,
    },
  };
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return 'text-green-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-yellow-600';
    case 'D': return 'text-orange-600';
    case 'E': return 'text-red-500';
    case 'F': return 'text-red-700';
    default: return 'text-gray-600';
  }
};

export const getFactorColor = (value: number): string => {
  if (value >= 1 && value <= 3) return 'bg-green-500';
  if (value >= 4 && value <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
};
