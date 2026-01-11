/**
 * 스토리지 어댑터
 * localStorage와 API 백엔드 중 선택해서 사용
 */

import { startGame, getGameSession, updateLocation, completeGame } from './apiService';

// 백엔드 사용 여부 (환경변수로 제어 가능)
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

export interface GameData {
  id?: string; // 백엔드 사용 시 세션 ID
  character: string;
  name: string;
  location?: string;
  step: number;
  quizResults?: Array<{
    quizId: string;
    userAnswer: boolean;
    isCorrect: boolean;
  }>;
  completedAt?: string;
}

const STORAGE_KEY = 'climate_explorer';

/**
 * 게임 데이터 저장
 */
export const saveGameData = async (data: GameData): Promise<void> => {
  if (USE_BACKEND) {
    // 백엔드 사용
    try {
      if (!data.id) {
        // 새 게임 시작
        const response = await startGame(data.character, data.name);
        if (response.success && response.data) {
          // 세션 ID를 localStorage에 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: response.data.id }));
        }
      } else {
        // 기존 게임 업데이트
        if (data.location && data.step === 2) {
          await updateLocation(data.id, data.location);
        }
        if (data.completedAt && data.quizResults) {
          await completeGame(data.id, data.quizResults);
        }
      }
    } catch (error) {
      console.error('API 저장 실패, localStorage로 대체:', error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } else {
    // localStorage 사용 (기존 방식)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
};

/**
 * 게임 데이터 로드
 */
export const loadGameData = async (): Promise<GameData | null> => {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  const data = JSON.parse(stored);

  if (USE_BACKEND && data.id) {
    // 백엔드에서 최신 데이터 가져오기
    try {
      const response = await getGameSession(data.id);
      if (response.success && response.data) {
        return {
          id: response.data.id,
          character: response.data.character,
          name: response.data.name,
          location: response.data.location,
          step: response.data.step,
          quizResults: response.data.quizResults,
          completedAt: response.data.completedAt,
        };
      }
    } catch (error) {
      console.error('API 로드 실패, localStorage 사용:', error);
    }
  }

  return data;
};

/**
 * 게임 데이터 삭제
 */
export const clearGameData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};
