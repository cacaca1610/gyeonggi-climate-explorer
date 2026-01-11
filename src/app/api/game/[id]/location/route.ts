import { NextRequest, NextResponse } from 'next/server';
import { getGameStore } from '@/lib/storeFactory';
import { UpdateLocationRequest, GameSessionResponse } from '@/types/api';

/**
 * PUT /api/game/:id/location
 * 게임 위치 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateLocationRequest = await request.json();

    if (!body.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'location은 필수입니다.',
        } as GameSessionResponse,
        { status: 400 }
      );
    }

    const store = getGameStore();
    const session = await store.updateSession(id, {
      location: body.location,
      step: 2,
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
      message: '위치가 업데이트되었습니다.',
    } as GameSessionResponse);
  } catch (error) {
    console.error('위치 업데이트 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      } as GameSessionResponse,
      { status: 500 }
    );
  }
}
