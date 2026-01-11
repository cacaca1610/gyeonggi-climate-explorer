// 인메모리 게임 세션 스토어
// 나중에 데이터베이스로 교체 가능

import { GameSession } from '@/types/api';

class GameStore {
  private sessions: Map<string, GameSession> = new Map();

  // 새 게임 세션 생성
  createSession(character: string, name: string): GameSession {
    const id = this.generateId();
    const now = new Date().toISOString();

    const session: GameSession = {
      id,
      character,
      name,
      step: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  // 게임 세션 조회
  getSession(id: string): GameSession | undefined {
    return this.sessions.get(id);
  }

  // 게임 세션 업데이트
  updateSession(id: string, updates: Partial<GameSession>): GameSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // 게임 세션 삭제
  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  // 전체 세션 조회 (리더보드용)
  getAllSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  // 완료된 세션만 조회
  getCompletedSessions(): GameSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.completedAt !== undefined
    );
  }

  // ID 생성 (UUID 대신 간단한 방식)
  private generateId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 세션 수 조회
  getSessionCount(): number {
    return this.sessions.size;
  }

  // 전체 세션 초기화 (개발용)
  clearAll(): void {
    this.sessions.clear();
  }
}

// 싱글톤 인스턴스
export const gameStore = new GameStore();
