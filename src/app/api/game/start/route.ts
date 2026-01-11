import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';
import { StartGameRequest, GameSessionResponse } from '@/types/api';

/**
 * POST /api/game/start
 * 새 게임 세션 시작
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartGameRequest = await request.json();

    // 유효성 검사
    if (!body.character || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'character와 name은 필수입니다.',
        } as GameSessionResponse,
        { status: 400 }
      );
    }

    if (body.name.length < 2 || body.name.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: '이름은 2-10자여야 합니다.',
        } as GameSessionResponse,
        { status: 400 }
      );
    }

    // 새 게임 세션 생성
    const store = getGameStore();
    const session = await store.createSession(body.character, body.name);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '게임 세션 생성에 실패했습니다.',
        } as GameSessionResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: session,
        message: '게임이 시작되었습니다.',
      } as GameSessionResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('게임 시작 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      } as GameSessionResponse,
      { status: 500 }
    );
  }
}
