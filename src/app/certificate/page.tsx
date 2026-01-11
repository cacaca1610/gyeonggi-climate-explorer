'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameData } from '@/utils/storage';
import { getClimateGrade } from '@/data/climateGrades';
import { getClimateGradeWithCache } from '@/utils/climateCalculator';
import { calculateScore, getGradeColor, getFactorColor } from '@/utils/scoreCalculator';
import { generateDiagnosis } from '@/utils/diagnosisGenerator';
import { getParks, getSheltersFromAPI, type Park, type Shelter } from '@/lib/ggClimate';
import ProgressBar from '@/components/ProgressBar';
import dynamic from 'next/dynamic';
import type { ClimateGrade } from '@/data/climateGrades';
import { motion } from 'framer-motion';

// Leaflet은 브라우저 전용이므로 dynamic import 사용
const ClimateMap = dynamic(() => import('@/components/ClimateMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-[20px] flex items-center justify-center">
      <p className="text-gray-600">지도 로딩 중...</p>
    </div>
  ),
});

export default function CertificatePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [character, setCharacter] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [earnedStars, setEarnedStars] = useState(0);
  const [climateGrade, setClimateGrade] = useState<ClimateGrade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parks, setParks] = useState<Park[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);

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

    const correctAnswers = gameData.quizResults?.filter(r => r.isCorrect).length || 0;
    setEarnedStars(correctAnswers);

    // API 데이터로 기후 등급 가져오기
    const fetchClimateData = async () => {
      setIsLoading(true);
      const cityName = gameData.location?.split(' ')[0] || '';

      const apiGrade = await getClimateGradeWithCache(gameData.location || '');

      if (apiGrade) {
        setClimateGrade(apiGrade);
      } else {
        // API 실패시 더미 데이터 사용
        const fallbackGrade = getClimateGrade(gameData.location || '');
        setClimateGrade(fallbackGrade);
      }

      // 공원과 대피소 데이터 로드
      const [parksData, sheltersData] = await Promise.all([
        getParks(20, cityName),
        getSheltersFromAPI(20, cityName),
      ]);
      setParks(parksData);
      setShelters(sheltersData);

      setIsLoading(false);
    };

    fetchClimateData();
  }, [router]);

  if (!isClient) {
    return null;
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌍</div>
          <p className="text-xl font-bold text-gray-800">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const scoreResult = calculateScore(climateGrade);
  const diagnosis = generateDiagnosis(scoreResult);

  const characterEmoji = character === '햇빛이' ? '🌞' : character === '물방울이' ? '💧' : '🌳';

  const factors = [
    { name: '폭염', value: scoreResult.factors.heat, emoji: '☀️' },
    { name: '홍수', value: scoreResult.factors.flood, emoji: '💧' },
    { name: '산사태', value: scoreResult.factors.landslide, emoji: '⛰️' },
    { name: '탄소', value: scoreResult.factors.carbon, emoji: '🚗' },
    { name: '녹지부족', value: scoreResult.factors.greenLack, emoji: '🌳' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[480px]">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/quiz')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium">이전으로</span>
        </button>

        {/* 진행률 표시 */}
        <ProgressBar currentStep={4} />

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🎉</div>
          <h1 className="text-[28px] font-bold text-gray-800">탐험 완료!</h1>
        </div>

        {/* 점수 카드 */}
        <div className="mb-6 p-6 rounded-[24px] shadow-lg bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
          <div className="text-center text-white">
            <div className="text-6xl mb-3">{characterEmoji}</div>
            <h2 className="text-2xl font-bold mb-2">{name} 탐험가</h2>
            <p className="text-sm mb-4 opacity-90">{location}</p>

            <div className="bg-white/20 backdrop-blur-sm rounded-[20px] p-6 mb-4">
              <p className="text-sm mb-2 opacity-90">생존점수</p>
              <div className="text-6xl font-bold mb-2">{scoreResult.totalScore}</div>
              <div className={`text-4xl font-bold ${getGradeColor(scoreResult.grade)}`}>
                {scoreResult.grade}등급
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">획득한 별</span>
              <div className="flex gap-1">
                {Array.from({ length: earnedStars }).map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 진단 문장 */}
        <div className="mb-6 p-5 bg-white rounded-[20px] shadow-md border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{diagnosis.emoji}</div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${diagnosis.color} mb-2`}>
                {diagnosis.title}
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                {diagnosis.message}
              </p>
            </div>
          </div>
        </div>

        {/* 5가지 요인 막대 그래프 */}
        <div className="mb-6 p-5 bg-white rounded-[20px] shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">우리 동네 위험 요인</h3>
          <div className="space-y-3">
            {factors.map((factor) => (
              <div key={factor.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{factor.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{factor.value}/10</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFactorColor(factor.value)} transition-all`}
                    style={{ width: `${(factor.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우리 동네 지도 */}
        <div className="mb-6 p-5 bg-white rounded-[20px] shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-3">🗺️ 우리 동네 환경 지도</h3>
          <p className="text-sm text-gray-600 mb-4">
            🌳 공원(초록색), 🏠 대피소(빨간색) 위치를 확인하세요!
          </p>
          <ClimateMap location={location} height="400px" parks={parks} shelters={shelters} />
        </div>

        {/* 위험 요인별 대처방법 */}
        <div className="mb-6 p-5 bg-white rounded-[20px] shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🛡️ 기후 위험 대응 가이드</h3>
          <div className="space-y-3">
            {/* 폭염 */}
            <div className={`p-4 rounded-[16px] border-l-4 ${
              scoreResult.factors.heat >= 6
                ? 'bg-orange-50 border-orange-400'
                : 'bg-orange-50/30 border-orange-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">☀️</span>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-2 ${
                    scoreResult.factors.heat >= 6 ? 'text-orange-700' : 'text-orange-600'
                  }`}>
                    폭염 {scoreResult.factors.heat >= 6 ? '대처법' : '예방법'} (위험도 {scoreResult.factors.heat}/10)
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {scoreResult.factors.heat >= 6 ? (
                      <>
                        <li>• 낮 12시~5시 외출 자제하기</li>
                        <li>• 그늘진 공원이나 실내 무더위쉼터 이용하기</li>
                        <li>• 물을 자주 마시고, 밝은 색 옷 입기</li>
                      </>
                    ) : (
                      <>
                        <li>• 여름철 외출 시 물병 챙기기</li>
                        <li>• 주변 무더위쉼터 위치 미리 확인하기</li>
                        <li>• 집 안 그늘막이나 창문 커튼 설치하기</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 홍수 */}
            <div className={`p-4 rounded-[16px] border-l-4 ${
              scoreResult.factors.flood >= 6
                ? 'bg-blue-50 border-blue-400'
                : 'bg-blue-50/30 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💧</span>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-2 ${
                    scoreResult.factors.flood >= 6 ? 'text-blue-700' : 'text-blue-600'
                  }`}>
                    홍수 {scoreResult.factors.flood >= 6 ? '대처법' : '예방법'} (위험도 {scoreResult.factors.flood}/10)
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {scoreResult.factors.flood >= 6 ? (
                      <>
                        <li>• 장마철 저지대, 하천 근처 피하기</li>
                        <li>• 대피소 위치 미리 확인하기</li>
                        <li>• 지하실이나 반지하 침수 대비하기</li>
                      </>
                    ) : (
                      <>
                        <li>• 배수구와 하수구 막힘 정기 점검하기</li>
                        <li>• 집 주변 낙엽과 쓰레기 치우기</li>
                        <li>• 장마철 대비 침수 방지판 준비하기</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 산사태 */}
            <div className={`p-4 rounded-[16px] border-l-4 ${
              scoreResult.factors.landslide >= 6
                ? 'bg-amber-50 border-amber-400'
                : 'bg-amber-50/30 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⛰️</span>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-2 ${
                    scoreResult.factors.landslide >= 6 ? 'text-amber-700' : 'text-amber-600'
                  }`}>
                    산사태 {scoreResult.factors.landslide >= 6 ? '대처법' : '예방법'} (위험도 {scoreResult.factors.landslide}/10)
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {scoreResult.factors.landslide >= 6 ? (
                      <>
                        <li>• 폭우 시 산 근처, 급경사지 피하기</li>
                        <li>• 산사태 위험 지역 표지판 확인하기</li>
                        <li>• 축대나 옹벽 균열 발견 시 신고하기</li>
                      </>
                    ) : (
                      <>
                        <li>• 산 근처 산책로 정기적으로 점검하기</li>
                        <li>• 집 주변 경사지 나무 심어 토양 안정화하기</li>
                        <li>• 폭우 예보 시 산악 지역 외출 자제하기</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 탄소배출 */}
            <div className={`p-4 rounded-[16px] border-l-4 ${
              scoreResult.factors.carbon >= 6
                ? 'bg-gray-50 border-gray-400'
                : 'bg-gray-50/30 border-gray-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚗</span>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-2 ${
                    scoreResult.factors.carbon >= 6 ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    탄소배출 {scoreResult.factors.carbon >= 6 ? '줄이기' : '예방하기'} (위험도 {scoreResult.factors.carbon}/10)
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {scoreResult.factors.carbon >= 6 ? (
                      <>
                        <li>• 가까운 거리는 걷거나 자전거 타기</li>
                        <li>• 대중교통 적극 이용하기</li>
                        <li>• 에너지 절약 (전등 끄기, 플러그 뽑기)</li>
                      </>
                    ) : (
                      <>
                        <li>• 대중교통 이용 습관 만들기</li>
                        <li>• 일회용품 대신 다회용품 사용하기</li>
                        <li>• 에어컨/난방 적정 온도 유지하기</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 녹지부족 */}
            <div className={`p-4 rounded-[16px] border-l-4 ${
              scoreResult.factors.greenLack >= 6
                ? 'bg-green-50 border-green-400'
                : 'bg-green-50/30 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌳</span>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-2 ${
                    scoreResult.factors.greenLack >= 6 ? 'text-green-700' : 'text-green-600'
                  }`}>
                    녹지 {scoreResult.factors.greenLack >= 6 ? '늘리기' : '가꾸기'} (위험도 {scoreResult.factors.greenLack}/10)
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {scoreResult.factors.greenLack >= 6 ? (
                      <>
                        <li>• 집에서 식물 키우기 (화분, 텃밭)</li>
                        <li>• 동네 공원 가꾸기 참여하기</li>
                        <li>• 나무 심기 행사 적극 참여하기</li>
                      </>
                    ) : (
                      <>
                        <li>• 베란다나 옥상 텃밭 만들기</li>
                        <li>• 주말에 가족과 공원 산책하기</li>
                        <li>• 공원 환경 정화 활동 참여하기</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={() => router.push('/final')}
          className="w-full h-[56px] text-lg font-bold rounded-[28px] bg-[#4CAF50] text-white hover:bg-[#45a049] shadow-lg transition-all"
        >
          수료증 받기
        </button>
      </div>
    </motion.div>
  );
}
