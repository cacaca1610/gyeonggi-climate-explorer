// 스토어 팩토리 - 환경에 따라 적절한 스토어 선택

import { gameStore } from './gameStore';
import { supabaseStore } from './supabaseStore';

// Supabase 사용 여부 확인
const USE_SUPABASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 환경에 따라 적절한 스토어 반환
 * - Supabase 환경변수가 설정되어 있으면 supabaseStore
 * - 없으면 인메모리 gameStore
 */
export const getGameStore = () => {
  if (USE_SUPABASE) {
    console.log('🗄️  Supabase 데이터베이스 사용');
    return supabaseStore;
  } else {
    console.log('💾 인메모리 스토어 사용');
    return gameStore;
  }
};

export type GameStoreType = typeof gameStore | typeof supabaseStore;
