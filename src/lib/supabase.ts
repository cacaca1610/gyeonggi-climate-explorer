import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. 인메모리 스토어를 사용합니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 타입 정의
export interface Database {
  public: {
    Tables: {
      game_sessions: {
        Row: {
          id: string;
          character: string;
          name: string;
          location: string | null;
          step: number;
          quiz_results: any | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character: string;
          name: string;
          location?: string | null;
          step?: number;
          quiz_results?: any | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          character?: string;
          name?: string;
          location?: string | null;
          step?: number;
          quiz_results?: any | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
