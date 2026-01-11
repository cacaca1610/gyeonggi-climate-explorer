import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';

/**
 * GET /api/game
 * 전체 게임 세션 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const store = getGameStore();
    const sessions = await store.getAllSessions();

    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('게임 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
