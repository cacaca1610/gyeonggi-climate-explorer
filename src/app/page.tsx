'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { characters } from '@/data/characters';
import { saveGameData } from '@/utils/storage';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = () => {
    if (selectedCharacter && playerName.length >= 2 && playerName.length <= 10) {
      saveGameData({
        character: selectedCharacter,
        name: playerName,
        step: 1,
      });
      router.push('/location');
    }
  };

  const isFormValid = selectedCharacter && playerName.length >= 2 && playerName.length <= 10;

  if (!isClient) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[480px]">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🌍</div>
          <h1 className="text-[32px] font-bold mb-2 text-gray-800">
            경기도 기후 탐험대
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            우리 동네 기후를 탐험해요!
          </p>

          {/* 서비스 소개 */}
          <div className="bg-white rounded-[20px] p-5 shadow-md mb-6">
            <div className="flex items-start gap-3 text-left">
              <div className="text-3xl">📚</div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-gray-800 mb-2">
                  무엇을 배우나요?
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>☀️ 폭염과 더위 대처법</li>
                  <li>💧 홍수와 물 관리</li>
                  <li>⛰️ 산사태 위험 이해</li>
                  <li>🚗 탄소와 환경 보호</li>
                  <li>🌳 녹지와 공원의 중요성</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 캐릭터 선택 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
            탐험가를 선택해요!
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {characters.map((char) => (
              <motion.button
                key={char.id}
                onClick={() => setSelectedCharacter(char.name)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-white rounded-[20px] p-4 shadow-md transition-all ${
                  selectedCharacter === char.name
                    ? 'ring-4 ring-yellow-400 shadow-xl'
                    : 'hover:shadow-lg'
                }`}
              >
                <motion.div
                  className="text-5xl mb-2"
                  animate={selectedCharacter === char.name ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {char.emoji}
                </motion.div>
                <div className="text-sm font-bold text-gray-800 mb-1">
                  {char.name}
                </div>
                <div className="text-xs text-blue-600 font-bold mb-1">
                  {char.power}
                </div>
                <div className="text-xs text-gray-600 leading-tight">
                  {char.detail}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 선택한 캐릭터의 인사말 */}
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-[20px] shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">
                {characters.find(c => c.name === selectedCharacter)?.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {selectedCharacter}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {characters.find(c => c.name === selectedCharacter)?.greeting}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 이름 입력 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
            이름을 알려줘!
          </h2>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="이름을 입력하세요 (2-10자)"
            maxLength={10}
            className="w-full px-4 py-3 text-lg rounded-[20px] border-2 border-gray-300 focus:border-[#4CAF50] focus:outline-none shadow-sm"
          />
          {playerName && (playerName.length < 2 || playerName.length > 10) && (
            <p className="text-sm text-red-500 mt-2 text-center">
              이름은 2-10자로 입력해주세요
            </p>
          )}
        </div>

        {/* 탐험 시작 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full h-[56px] text-lg font-bold rounded-[28px] shadow-lg transition-all ${
            isFormValid
              ? 'bg-[#4CAF50] text-white hover:bg-[#45a049] cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          탐험 시작!
        </button>
      </div>
    </motion.div>
  );
}
