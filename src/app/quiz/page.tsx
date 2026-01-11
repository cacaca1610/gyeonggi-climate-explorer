'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizzes } from '@/data/quizzes';
import { getClimateGrade, getGradeLevel } from '@/data/climateGrades';
import { characters } from '@/data/characters';
import { loadGameData, saveGameData } from '@/utils/storage';
import ProgressBar from '@/components/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function QuizPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [quizResults, setQuizResults] = useState<Array<{
    quizId: string;
    userAnswer: boolean;
    isCorrect: boolean;
  }>>([]);
  const [location, setLocation] = useState<string>('');
  const [character, setCharacter] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    const gameData = loadGameData();
    if (!gameData || !gameData.location) {
      router.push('/');
      return;
    }
    setLocation(gameData.location);
    setCharacter(gameData.character || '');
  }, [router]);

  const currentQuiz = quizzes[currentQuizIndex];
  const climateGrade = getClimateGrade(location);
  const selectedCharacterData = characters.find(c => c.name === character);

  const getCategoryGrade = (category: string) => {
    switch (category) {
      case 'heat': return climateGrade.heat;
      case 'flood': return climateGrade.flood;
      case 'landslide': return climateGrade.landslide;
      case 'carbon': return climateGrade.carbon;
      case 'green': return climateGrade.green;
      default: return 5;
    }
  };

  const getCharacterPhrase = (isCorrect: boolean) => {
    if (!selectedCharacterData) return isCorrect ? '정답이에요!' : '아쉬워요!';
    const phrases = isCorrect ? selectedCharacterData.correctPhrases : selectedCharacterData.wrongPhrases;
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuiz.answer;
    if (isCorrect) {
      setEarnedStars(earnedStars + 1);
      // 정답 시 confetti 효과
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
    }

    const newResult = {
      quizId: currentQuiz.id,
      userAnswer: answer,
      isCorrect,
    };

    setQuizResults([...quizResults, newResult]);
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 퀴즈 완료 - 로컬스토리지 저장 후 수료증 화면으로 이동
      const gameData = loadGameData();
      if (gameData) {
        // 현재 퀴즈 결과를 포함한 전체 결과 저장
        const finalResults = selectedAnswer !== null ? [
          ...quizResults,
        ] : quizResults;

        saveGameData({
          ...gameData,
          quizResults: finalResults,
          step: 3,
          completedAt: new Date().toISOString(),
        });
      }
      router.push('/certificate');
    }
  };

  if (!isClient || !currentQuiz) {
    return null;
  }

  const categoryGrade = getCategoryGrade(currentQuiz.category);
  const gradeInfo = getGradeLevel(categoryGrade);
  const isCorrect = selectedAnswer === currentQuiz.answer;

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
          onClick={() => router.push('/location')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium">이전으로</span>
        </button>

        {/* 진행률 표시 */}
        <ProgressBar currentStep={3} />

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{currentQuiz.emoji}</div>
          <h1 className="text-[28px] font-bold text-gray-800">
            {currentQuiz.categoryName} 위기
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentQuizIndex + 1} / {quizzes.length}
          </p>
        </div>

        {/* 캐릭터 말풍선 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[20px] shadow-md relative"
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="text-4xl"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {character === '햇빛이' ? '🌞' : character === '물방울이' ? '💧' : '🌳'}
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 mb-1">{character}</p>
              <p className="text-base text-gray-800 leading-relaxed">{currentQuiz.intro}</p>
            </div>
          </div>
        </motion.div>

        {/* 우리 동네 등급 */}
        <div className="mb-6 p-4 bg-white rounded-[20px] shadow-sm">
          <p className="text-sm text-gray-600 mb-2">우리 동네 {currentQuiz.categoryName} 등급</p>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full ${gradeInfo.bgColor}`}>
              <span className={`text-lg font-bold ${gradeInfo.color}`}>
                {gradeInfo.level}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              등급 {categoryGrade}/10
            </span>
          </div>
        </div>

        {/* 퀴즈 문제 */}
        <div className="mb-6 p-6 bg-white rounded-[20px] shadow-md">
          <p className="text-lg font-bold text-gray-800 text-center leading-relaxed">
            {currentQuiz.question}
          </p>
        </div>

        {/* O/X 버튼 */}
        {!showResult ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleAnswer(true)}
              className="h-[80px] bg-white rounded-[20px] shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-[#4CAF50]"
            >
              <div className="text-4xl mb-1">⭕</div>
              <div className="text-lg font-bold text-gray-800">O</div>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="h-[80px] bg-white rounded-[20px] shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-red-500"
            >
              <div className="text-4xl mb-1">❌</div>
              <div className="text-lg font-bold text-gray-800">X</div>
            </button>
          </div>
        ) : (
          <div>
            {/* 캐릭터 반응 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 p-4 bg-white rounded-[20px] shadow-md"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="text-5xl"
                  animate={{
                    rotate: isCorrect ? [0, -10, 10, -10, 0] : [0, -5, 5, 0],
                    scale: isCorrect ? [1, 1.2, 1] : [1, 0.9, 1],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {character === '햇빛이' ? '🌞' : character === '물방울이' ? '💧' : '🌳'}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    {character}
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {getCharacterPhrase(isCorrect)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 정답/오답 표시 */}
            <div className={`mb-4 p-6 rounded-[20px] ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
              <div className="text-center mb-3">
                <div className="text-5xl mb-2">{isCorrect ? '🎉' : '💡'}</div>
                <p className={`text-xl font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                  {isCorrect ? '정답!' : '다시 도전!'}
                </p>
                {isCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="text-3xl mt-2"
                  >
                    ⭐
                  </motion.div>
                )}
              </div>
              <p className="text-base text-gray-800 text-center leading-relaxed">
                {currentQuiz.explanation}
              </p>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNext}
              className="w-full h-[56px] text-lg font-bold rounded-[28px] bg-[#4CAF50] text-white hover:bg-[#45a049] shadow-lg transition-all"
            >
              {currentQuizIndex < quizzes.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          </div>
        )}

        {/* 획득한 별 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">획득한 별</p>
          <div className="flex justify-center gap-1">
            <AnimatePresence>
              {Array.from({ length: earnedStars }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: i * 0.1
                  }}
                  className="text-2xl"
                >
                  ⭐
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
