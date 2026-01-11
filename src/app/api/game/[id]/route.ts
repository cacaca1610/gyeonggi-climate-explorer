import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';
import { GameSessionResponse } from '@/types/api';

/**
 * GET /api/game/:id
 * 게임 세션 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = getGameStore();
    const session = await store.getSession(params.id);

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
    } as GameSessionResponse);
  } catch (error) {
    console.error('게임 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      } as GameSessionResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/game/:id
 * 게임 세션 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = getGameStore();
    const deleted = await store.deleteSession(params.id);

    if (!deleted) {
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
      message: '게임 세션이 삭제되었습니다.',
    } as GameSessionResponse);
  } catch (error) {
    console.error('게임 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      } as GameSessionResponse,
      { status: 500 }
    );
  }
}
