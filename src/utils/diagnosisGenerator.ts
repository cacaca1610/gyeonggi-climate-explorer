import { ScoreResult } from './scoreCalculator';

export interface DiagnosisMessage {
  title: string;
  message: string;
  emoji: string;
  color: string;
}

export const generateDiagnosis = (scoreResult: ScoreResult): DiagnosisMessage => {
  const { totalScore, factors } = scoreResult;

  // 가장 높은 위험 요인 찾기
  const maxFactor = Math.max(
    factors.heat,
    factors.flood,
    factors.landslide,
    factors.carbon,
    factors.greenLack
  );

  let highRiskCategory = '';
  if (maxFactor === factors.heat) highRiskCategory = '폭염';
  else if (maxFactor === factors.flood) highRiskCategory = '홍수';
  else if (maxFactor === factors.landslide) highRiskCategory = '산사태';
  else if (maxFactor === factors.carbon) highRiskCategory = '탄소배출';
  else highRiskCategory = '녹지부족';

  // 점수별 진단
  if (totalScore >= 80) {
    return {
      title: '우리 동네는 기후 안전해요!',
      message: `환경이 잘 관리되고 있어요. 계속해서 깨끗한 환경을 지켜나가요!`,
      emoji: '🌟',
      color: 'text-green-600',
    };
  } else if (totalScore >= 70) {
    return {
      title: `${highRiskCategory}에 주의가 필요해요`,
      message: `우리 동네는 ${highRiskCategory} 위험이 조금 있어요. 날씨 정보를 자주 확인하세요!`,
      emoji: '⚠️',
      color: 'text-yellow-600',
    };
  } else if (totalScore >= 60) {
    return {
      title: `${highRiskCategory}에 취약해요`,
      message: `우리 동네는 ${highRiskCategory} 위험이 있어요. 대피 장소와 안전 수칙을 미리 알아두세요!`,
      emoji: '🚨',
      color: 'text-orange-600',
    };
  } else {
    return {
      title: `${highRiskCategory} 위험도가 높아요`,
      message: `우리 동네는 ${highRiskCategory} 위험이 높아요. 무더위쉼터와 안전 정보를 꼭 확인하세요!`,
      emoji: '🆘',
      color: 'text-red-600',
    };
  }
};

export const getFactorAdvice = (factorName: string, value: number): string => {
  if (value <= 3) {
    return `${factorName}은 안전한 수준이에요! 👍`;
  } else if (value <= 6) {
    return `${factorName}에 주의하세요. 예방이 중요해요!`;
  } else {
    return `${factorName} 위험이 높아요. 안전 수칙을 지켜주세요!`;
  }
};
