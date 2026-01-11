import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';

/**
 * GET /api/game/stats
 * 게임 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const store = getGameStore();
    const allSessions = await store.getAllSessions();
    const completedSessions = await store.getCompletedSessions();

    const stats = {
      totalGames: allSessions.length,
      completedGames: completedSessions.length,
      inProgressGames: allSessions.length - completedSessions.length,
      characterStats: getCharacterStats(allSessions),
      locationStats: getLocationStats(completedSessions),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

function getCharacterStats(sessions: any[]) {
  const stats: Record<string, number> = {};
  sessions.forEach((session) => {
    stats[session.character] = (stats[session.character] || 0) + 1;
  });
  return stats;
}

function getLocationStats(sessions: any[]) {
  const stats: Record<string, number> = {};
  sessions.forEach((session) => {
    if (session.location) {
      stats[session.location] = (stats[session.location] || 0) + 1;
    }
  });
  return stats;
}
