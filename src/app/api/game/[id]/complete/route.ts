import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';
import { CompleteGameRequest, GameSessionResponse } from '@/types/api';

/**
 * POST /api/game/:id/complete
 * 게임 완료
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: CompleteGameRequest = await request.json();

    if (!body.quizResults || !Array.isArray(body.quizResults)) {
      return NextResponse.json(
        {
          success: false,
          error: 'quizResults는 배열이어야 합니다.',
        } as GameSessionResponse,
        { status: 400 }
      );
    }

    const store = getGameStore();
    const session = await store.updateSession(id, {
      quizResults: body.quizResults,
      step: 3,
      completedAt: new Date().toISOString(),
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '게임 세션을 찾을 수 없습니다.',
        } as GameSessionResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
      message: '게임이 완료되었습니다!',
    } as GameSessionResponse);
  } catch (error) {
    console.error('게임 완료 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      } as GameSessionResponse,
      { status: 500 }
    );
  }
}
