// Supabase 기반 게임 세션 스토어

import { supabase } from './supabase';
import { GameSession } from '@/types/api';

class SupabaseGameStore {
  /**
   * 새 게임 세션 생성
   */
  async createSession(character: string, name: string): Promise<GameSession | null> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          character,
          name,
          step: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase 생성 오류:', error);
        return null;
      }

      return this.mapToGameSession(data);
    } catch (error) {
      console.error('게임 세션 생성 실패:', error);
      return null;
    }
  }

  /**
   * 게임 세션 조회
   */
  async getSession(id: string): Promise<GameSession | null> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase 조회 오류:', error);
        return null;
      }

      return this.mapToGameSession(data);
    } catch (error) {
      console.error('게임 세션 조회 실패:', error);
      return null;
    }
  }

  /**
   * 게임 세션 업데이트
   */
  async updateSession(
    id: string,
    updates: Partial<GameSession>
  ): Promise<GameSession | null> {
    try {
      const updateData: any = {};

      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.step !== undefined) updateData.step = updates.step;
      if (updates.quizResults !== undefined) {
        updateData.quiz_results = updates.quizResults;
      }
      if (updates.completedAt !== undefined) {
        updateData.completed_at = updates.completedAt;
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase 업데이트 오류:', error);
        return null;
      }

      return this.mapToGameSession(data);
    } catch (error) {
      console.error('게임 세션 업데이트 실패:', error);
      return null;
    }
  }

  /**
   * 게임 세션 삭제
   */
  async deleteSession(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase 삭제 오류:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('게임 세션 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 전체 세션 조회
   */
  async getAllSessions(): Promise<GameSession[]> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase 목록 조회 오류:', error);
        return [];
      }

      return data.map((row) => this.mapToGameSession(row));
    } catch (error) {
      console.error('전체 세션 조회 실패:', error);
      return [];
    }
  }

  /**
   * 완료된 세션만 조회
   */
  async getCompletedSessions(): Promise<GameSession[]> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase 완료 세션 조회 오류:', error);
        return [];
      }

      return data.map((row) => this.mapToGameSession(row));
    } catch (error) {
      console.error('완료 세션 조회 실패:', error);
      return [];
    }
  }

  /**
   * 세션 수 조회
   */
  async getSessionCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase 카운트 오류:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('세션 카운트 실패:', error);
      return 0;
    }
  }

  /**
   * DB 행을 GameSession 타입으로 변환
   */
  private mapToGameSession(row: any): GameSession {
    return {
      id: row.id,
      character: row.character,
      name: row.name,
      location: row.location,
      step: row.step,
      quizResults: row.quiz_results,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * 캐릭터별 통계
   */
  async getCharacterStats(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('character');

      if (error) {
        console.error('캐릭터 통계 오류:', error);
        return {};
      }

      const stats: Record<string, number> = {};
      data.forEach((row) => {
        stats[row.character] = (stats[row.character] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('캐릭터 통계 실패:', error);
      return {};
    }
  }

  /**
   * 지역별 통계
   */
  async getLocationStats(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('location')
        .not('location', 'is', null)
        .not('completed_at', 'is', null);

      if (error) {
        console.error('지역 통계 오류:', error);
        return {};
      }

      const stats: Record<string, number> = {};
      data.forEach((row) => {
        if (row.location) {
          stats[row.location] = (stats[row.location] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('지역 통계 실패:', error);
      return {};
    }
  }
}

// 싱글톤 인스턴스
export const supabaseStore = new SupabaseGameStore();
