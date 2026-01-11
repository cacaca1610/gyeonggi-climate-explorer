// API 호출 유틸리티

import {
  StartGameRequest,
  UpdateLocationRequest,
  CompleteGameRequest,
  GameSessionResponse,
  ApiResponse,
} from '@/types/api';

const API_BASE = '/api/game';

/**
 * 새 게임 시작
 */
export async function startGame(
  character: string,
  name: string
): Promise<GameSessionResponse> {
  const response = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ character, name } as StartGameRequest),
  });

  return response.json();
}

/**
 * 게임 세션 조회
 */
export async function getGameSession(id: string): Promise<GameSessionResponse> {
  const response = await fetch(`${API_BASE}/${id}`);
  return response.json();
}

/**
 * 위치 업데이트
 */
export async function updateLocation(
  id: string,
  location: string
): Promise<GameSessionResponse> {
  const response = await fetch(`${API_BASE}/${id}/location`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location } as UpdateLocationRequest),
  });

  return response.json();
}

/**
 * 게임 완료
 */
export async function completeGame(
  id: string,
  quizResults: any[]
): Promise<GameSessionResponse> {
  const response = await fetch(`${API_BASE}/${id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quizResults } as CompleteGameRequest),
  });

  return response.json();
}

/**
 * 게임 세션 삭제
 */
export async function deleteGameSession(id: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  return response.json();
}

/**
 * 게임 통계 조회
 */
export async function getGameStats(): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/stats`);
  return response.json();
}
