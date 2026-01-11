'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { loadGameData, clearGameData } from '@/utils/storage';
import { getClimateGrade } from '@/data/climateGrades';
import { calculateScore } from '@/utils/scoreCalculator';
import ProgressBar from '@/components/ProgressBar';
import { motion } from 'framer-motion';

export default function FinalPage() {
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [character, setCharacter] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [score, setScore] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [completedDate, setCompletedDate] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const gameData = loadGameData();
    if (!gameData || !gameData.completedAt) {
      router.push('/');
      return;
    }

    setCharacter(gameData.character || '');
    setName(gameData.name || '');
    setLocation(gameData.location || '');

    const climateGrade = getClimateGrade(gameData.location || '');
    const scoreResult = calculateScore(climateGrade);
    setScore(scoreResult.totalScore);

    const correctAnswers = gameData.quizResults?.filter(r => r.isCorrect).length || 0;
    setEarnedStars(correctAnswers);

    // 날짜 포맷팅
    const date = new Date(gameData.completedAt);
    const formatted = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    setCompletedDate(formatted);
  }, [router]);

  const handleDownload = async () => {
    if (!certificateRef.current) {
      alert('수료증을 찾을 수 없습니다.');
      return;
    }

    setIsDownloading(true);

    try {
      console.log('📸 수료증 캡처 시작...');

      // 잠시 대기하여 렌더링 완료
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🖼️ html2canvas 실행 중...');

      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#E3F2FD',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // 클론된 문서에서 문제가 될 수 있는 스타일 제거
          const clonedElement = clonedDoc.getElementById('certificate-content');
          if (clonedElement) {
            // 모든 자식 요소의 애니메이션 제거
            clonedElement.querySelectorAll('*').forEach((el: any) => {
              el.style.animation = 'none';
              el.style.transition = 'none';
            });
          }
        }
      });

      console.log('✅ Canvas 생성 완료:', canvas.width, 'x', canvas.height);

      // DataURL로 직접 다운로드
      const dataUrl = canvas.toDataURL('image/png');

      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Canvas가 비어있습니다');
      }

      console.log('💾 다운로드 링크 생성 중...');

      const link = document.createElement('a');
      link.download = `기후탐험대_수료증_${name}.png`;
      link.href = dataUrl;
      link.click();

      console.log('✅ 다운로드 완료!');
      alert('수료증이 저장되었습니다! 📥');

    } catch (error: any) {
      console.error('❌ 이미지 저장 실패:', error);
      console.error('에러 상세:', error.message, error.stack);
      alert(`이미지 저장에 실패했습니다.\n에러: ${error.message}\n\n콘솔(F12)을 확인해주세요.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 복사되었습니다! 친구들과 공유해보세요!');
    }).catch(() => {
      alert('링크 복사에 실패했습니다.');
    });
  };

  const handleRestart = () => {
    if (confirm('처음부터 다시 시작하시겠습니까?')) {
      clearGameData();
      router.push('/');
    }
  };

  if (!isClient) {
    return null;
  }

  const characterEmoji = character === '햇빛이' ? '🌞' : character === '물방울이' ? '💧' : '🌳';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[480px]">
        {/* 진행률 표시 */}
        <ProgressBar currentStep={5} />

        {/* 수료증 카드 */}
        <div
          id="certificate-content"
          ref={certificateRef}
          className="mb-6 p-8 rounded-[32px] shadow-2xl border-8 border-double"
          style={{
            backgroundColor: '#FFF9E5',
            borderColor: '#FF6B9D',
          }}
        >
          {/* 장식 - 상단 별들 */}
          <div className="flex justify-center gap-3 mb-4">
            <span className="text-4xl">⭐</span>
            <span className="text-5xl">🌟</span>
            <span className="text-4xl">⭐</span>
          </div>

          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-3">
              <span className="text-5xl">🏆</span>
              <h1 className="text-3xl font-black" style={{ color: '#9333EA' }}>
                수료증
              </h1>
              <span className="text-5xl">🏆</span>
            </div>
            <div className="h-1 w-32 mx-auto rounded-full" style={{ backgroundColor: '#FBBF24' }}></div>
          </div>

          {/* 캐릭터 */}
          <div className="text-center mb-6 relative">
            <div className="inline-block relative">
              <div className="text-9xl">{characterEmoji}</div>
              <span className="absolute -top-2 -right-2 text-4xl">✨</span>
              <span className="absolute -top-2 -left-2 text-4xl">✨</span>
            </div>
          </div>

          {/* 내용 */}
          <div className="text-center mb-6 rounded-[24px] p-6 border-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: '#FCD34D' }}>
            <p className="text-2xl mb-4">
              <span className="font-black text-4xl" style={{ color: '#DB2777' }}>{name}</span>
            </p>
            <p className="text-xl font-bold leading-relaxed mb-2" style={{ color: '#1F2937' }}>
              위 어린이는
            </p>
            <p className="text-2xl font-black mb-2" style={{ color: '#9333EA' }}>
              경기도 기후 탐험대
            </p>
            <p className="text-xl font-bold leading-relaxed" style={{ color: '#1F2937' }}>
              과정을 훌륭하게<br />
              완수하였기에<br />
              이 상장을 드립니다
            </p>
          </div>

          {/* 세부 정보 */}
          <div className="rounded-[20px] p-5 mb-6 border-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#93C5FD' }}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-[12px] p-3" style={{ backgroundColor: '#DBEAFE' }}>
                <p className="text-3xl mb-1">📍</p>
                <p className="text-xs mb-1" style={{ color: '#4B5563' }}>탐험 지역</p>
                <p className="font-bold text-sm" style={{ color: '#1F2937' }}>{location}</p>
              </div>
              <div className="rounded-[12px] p-3" style={{ backgroundColor: '#F3E8FF' }}>
                <p className="text-3xl mb-1">📊</p>
                <p className="text-xs mb-1" style={{ color: '#4B5563' }}>생존 점수</p>
                <p className="font-bold text-lg" style={{ color: '#9333EA' }}>{score}점</p>
              </div>
            </div>
            <div className="mt-4 rounded-[12px] p-3 text-center" style={{ backgroundColor: '#FEF3C7' }}>
              <p className="text-3xl mb-1">⭐</p>
              <p className="text-xs mb-1" style={{ color: '#4B5563' }}>획득한 별</p>
              <p className="font-bold text-lg" style={{ color: '#CA8A04' }}>{earnedStars}개</p>
            </div>
          </div>

          {/* 날짜 및 서명 */}
          <div className="text-center space-y-3">
            <p className="text-base font-bold" style={{ color: '#374151' }}>{completedDate}</p>
            <div className="h-0.5 w-24 mx-auto rounded-full" style={{ backgroundColor: '#9CA3AF' }}></div>
            <p className="text-xl font-black" style={{ color: '#1F2937' }}>경기도 기후 탐험대장</p>
          </div>

          {/* 장식 - 하단 하트들 */}
          <div className="flex justify-center gap-2 mt-6">
            <span className="text-3xl">💚</span>
            <span className="text-3xl">💙</span>
            <span className="text-3xl">💛</span>
            <span className="text-3xl">💜</span>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full h-[56px] text-lg font-bold rounded-[28px] shadow-lg transition-all flex items-center justify-center gap-2 ${
              isDownloading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isDownloading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>저장하기</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="w-full h-[56px] text-lg font-bold rounded-[28px] bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            <span>공유하기</span>
          </button>

          <button
            onClick={handleRestart}
            className="w-full h-[56px] text-lg font-bold rounded-[28px] bg-gray-500 text-white hover:bg-gray-600 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>다시 하기</span>
          </button>
        </div>

        {/* 하단 메시지 */}
        <div className="text-center p-4 bg-white rounded-[20px] shadow-sm">
          <p className="text-base text-gray-800">
            기후 탐험가 <span className="font-bold text-green-600">{name}</span>,<br />
            앞으로도 지구를 지켜줘요! 🌍
          </p>
        </div>
      </div>
    </motion.div>
  );
}
