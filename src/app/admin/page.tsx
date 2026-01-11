'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GameSession {
  id: string;
  character: string;
  name: string;
  location?: string;
  step: number;
  completedAt?: string;
  createdAt: string;
}

interface Stats {
  totalGames: number;
  completedGames: number;
  inProgressGames: number;
  characterStats: Record<string, number>;
  locationStats: Record<string, number>;
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('/api/game'),
        fetch('/api/game/stats'),
      ]);

      const sessionsData = await sessionsRes.json();
      const statsData = await statsRes.json();

      if (sessionsData.success) {
        setSessions(sessionsData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-xl font-bold text-gray-800">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 관리자 대시보드
          </h1>
          <p className="text-gray-600">경기도 기후 탐험대 게임 통계</p>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[20px] shadow-md">
              <h3 className="text-gray-600 text-sm mb-2">총 게임 수</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalGames}</p>
            </div>

            <div className="bg-white p-6 rounded-[20px] shadow-md">
              <h3 className="text-gray-600 text-sm mb-2">완료된 게임</h3>
              <p className="text-4xl font-bold text-green-600">
                {stats.completedGames}
              </p>
            </div>

            <div className="bg-white p-6 rounded-[20px] shadow-md">
              <h3 className="text-gray-600 text-sm mb-2">진행 중</h3>
              <p className="text-4xl font-bold text-orange-600">
                {stats.inProgressGames}
              </p>
            </div>
          </div>
        )}

        {/* 캐릭터 통계 */}
        {stats && Object.keys(stats.characterStats).length > 0 && (
          <div className="bg-white p-6 rounded-[20px] shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              캐릭터별 통계
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.characterStats).map(([char, count]) => (
                <div
                  key={char}
                  className="bg-blue-50 p-4 rounded-[12px] text-center"
                >
                  <div className="text-3xl mb-2">
                    {char === '햇빛이' ? '☀️' : char === '물방울이' ? '💧' : '🌳'}
                  </div>
                  <p className="text-sm text-gray-600">{char}</p>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 지역별 통계 */}
        {stats && Object.keys(stats.locationStats).length > 0 && (
          <div className="bg-white p-6 rounded-[20px] shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              지역별 완료 통계
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.locationStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([location, count]) => (
                  <div
                    key={location}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]"
                  >
                    <span className="text-gray-800">{location}</span>
                    <span className="font-bold text-blue-600">{count}명</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 최근 게임 세션 */}
        <div className="bg-white p-6 rounded-[20px] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">최근 게임 세션</h2>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-[12px] hover:bg-blue-600 transition-colors"
            >
              🔄 새로고침
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm text-gray-600">ID</th>
                  <th className="text-left p-3 text-sm text-gray-600">이름</th>
                  <th className="text-left p-3 text-sm text-gray-600">캐릭터</th>
                  <th className="text-left p-3 text-sm text-gray-600">위치</th>
                  <th className="text-left p-3 text-sm text-gray-600">단계</th>
                  <th className="text-left p-3 text-sm text-gray-600">상태</th>
                  <th className="text-left p-3 text-sm text-gray-600">생성일</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 20).map((session) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-500 font-mono">
                      {session.id.substring(0, 20)}...
                    </td>
                    <td className="p-3 text-sm font-medium">{session.name}</td>
                    <td className="p-3 text-sm">{session.character}</td>
                    <td className="p-3 text-sm">{session.location || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {session.step}/5
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {session.completedAt ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          완료
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                          진행중
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
