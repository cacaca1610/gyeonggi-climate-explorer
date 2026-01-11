'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from '@/data/locations';
import { loadGameData, saveGameData } from '@/utils/storage';
import ProgressBar from '@/components/ProgressBar';
import { motion } from 'framer-motion';
import { getParks, getCityStats, getSheltersFromAPI, type Park, type Shelter } from '@/lib/ggClimate';
import dynamic from 'next/dynamic';

// 지도 컴포넌트는 동적 로딩
const ClimateMap = dynamic(() => import('@/components/ClimateMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-gray-100 rounded-[20px] flex items-center justify-center">
      <p className="text-gray-500">지도 불러오는 중...</p>
    </div>
  ),
});

export default function LocationPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedDong, setSelectedDong] = useState<string>('');
  const [character, setCharacter] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [cityStats, setCityStats] = useState<{ parkCount: number; shelterCount: number } | null>(null);
  const [parks, setParks] = useState<Park[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isLoadingMapData, setIsLoadingMapData] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const gameData = loadGameData();
    if (!gameData || !gameData.character || !gameData.name) {
      router.push('/');
      return;
    }
    setCharacter(gameData.character);
    setPlayerName(gameData.name);
  }, [router]);

  const selectedLocation = locations.find((loc) => loc.city === selectedCity);
  const selectedDistrictData = selectedLocation?.districts.find(
    (dist) => dist.district === selectedDistrict
  );

  // 시군 선택 시 통계 데이터 및 공원/대피소 데이터 로드
  useEffect(() => {
    if (selectedCity) {
      console.log('🔄 데이터 로드 시작:', selectedCity);
      setIsLoadingMapData(true);
      getCityStats(selectedCity).then(setCityStats);

      // 지도용 데이터 로드 (20개씩)
      setShowMap(true);
      Promise.all([
        getParks(20, selectedCity),
        getSheltersFromAPI(20, selectedCity)
      ]).then(([parksData, sheltersData]) => {
        console.log('✅ 공원 데이터:', parksData.length, '개');
        console.log('✅ 대피소 데이터:', sheltersData.length, '개');
        setParks(parksData);
        setShelters(sheltersData);
        setIsLoadingMapData(false);
      }).catch(error => {
        console.error('❌ 데이터 로드 실패:', error);
        setIsLoadingMapData(false);
      });
    } else {
      setCityStats(null);
      setParks([]);
      setShelters([]);
      setShowMap(false);
      setIsLoadingMapData(false);
    }
  }, [selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');
    setSelectedDong('');
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedDong('');
  };

  const handleSubmit = () => {
    const gameData = loadGameData();
    if (!gameData) return;

    // dongs가 있으면 3단계까지, 없으면 2단계까지
    const hasDongs = selectedDistrictData && selectedDistrictData.dongs.length > 0;
    const location = hasDongs
      ? `${selectedCity} ${selectedDistrict} ${selectedDong}`
      : `${selectedCity} ${selectedDistrict}`;

    if ((hasDongs && selectedCity && selectedDistrict && selectedDong) ||
        (!hasDongs && selectedCity && selectedDistrict)) {
      saveGameData({
        ...gameData,
        location,
        step: 2,
      });
      router.push('/quiz');
    }
  };

  // dongs가 있으면 3단계까지, 없으면 2단계까지 필요
  const hasDongs = selectedDistrictData && selectedDistrictData.dongs.length > 0;
  const isFormValid = hasDongs
    ? (selectedCity && selectedDistrict && selectedDong)
    : (selectedCity && selectedDistrict);

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
      <div className="w-full max-w-[900px]">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium">이전으로</span>
        </button>

        {/* 진행률 표시 */}
        <ProgressBar currentStep={2} />

        {/* 캐릭터 정보 */}
        {character && (
          <div className="mb-4 p-4 bg-white rounded-[20px] shadow-md">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{characterEmoji}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">탐험가</p>
                <p className="text-xl font-bold text-gray-800">{playerName}</p>
                <p className="text-sm text-blue-600">{character}</p>
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-[28px] font-bold mb-2 text-gray-800">
            어느 동네를 탐험할까요?
          </h1>
          <p className="text-base text-gray-600">
            경기도 31개 시군구 중 우리 동네를 선택해주세요
          </p>
        </div>

        {/* 시군 선택 */}
        <div className="mb-4">
          <label className="block text-base font-bold text-gray-800 mb-2">
            1. 시/군 선택
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-[20px] border-2 border-gray-300 focus:border-[#4CAF50] focus:outline-none shadow-sm bg-white"
          >
            <option value="">시/군을 선택하세요</option>
            {[...locations].sort((a, b) => a.city.localeCompare(b.city, 'ko-KR')).map((location) => (
              <option key={location.city} value={location.city}>
                {location.city}
              </option>
            ))}
          </select>
        </div>

        {/* 통계 정보 */}
        {cityStats && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-[20px] shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-2">🌳 {selectedCity} 기후 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-gray-600">공원</p>
                <p className="text-lg font-bold text-green-600">{cityStats.parkCount}개+</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-gray-600">대피소</p>
                <p className="text-lg font-bold text-red-600">{cityStats.shelterCount}개+</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              상위 100개 시설 기준
            </p>
          </div>
        )}

        {/* 구/읍면/동 선택 */}
        <div className="mb-4">
          <label className="block text-base font-bold text-gray-800 mb-2">
            2. {selectedLocation?.districts[0]?.dongs.length > 0 ? '구 선택' : '읍/면/동 선택'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedCity}
            className={`w-full px-4 py-3 text-base rounded-[20px] border-2 border-gray-300 focus:border-[#4CAF50] focus:outline-none shadow-sm bg-white ${
              !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">
              {selectedLocation?.districts[0]?.dongs.length > 0 ? '구를 선택하세요' : '읍/면/동을 선택하세요'}
            </option>
            {selectedLocation?.districts
              .slice()
              .sort((a, b) => a.district.localeCompare(b.district, 'ko-KR'))
              .map((district) => (
                <option key={district.district} value={district.district}>
                  {district.district}
                </option>
              ))}
          </select>
        </div>

        {/* 동/리 선택 - dongs가 있을 때만 표시 */}
        {hasDongs && (
          <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-2">
              3. 동/리 선택
            </label>
            <select
              value={selectedDong}
              onChange={(e) => setSelectedDong(e.target.value)}
              disabled={!selectedDistrict}
              className={`w-full px-4 py-3 text-base rounded-[20px] border-2 border-gray-300 focus:border-[#4CAF50] focus:outline-none shadow-sm bg-white ${
                !selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">동/리를 선택하세요</option>
              {selectedDistrictData?.dongs
                .slice()
                .sort((a, b) => a.localeCompare(b, 'ko-KR'))
                .map((dong) => (
                  <option key={dong} value={dong}>
                    {dong}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* 지도 */}
        {showMap && selectedCity && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              🗺️ {selectedCity} 주요 시설 지도
            </h3>
            {isLoadingMapData ? (
              <div className="h-[350px] bg-gray-100 rounded-[20px] flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                <p className="text-gray-600 font-medium">데이터를 불러오는 중...</p>
                <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-2">
                  지도에 표시: 🌳 공원 {parks.length}개 · 🏠 대피소 {shelters.length}개
                </p>
                <ClimateMap location={selectedCity} height="350px" parks={parks} shelters={shelters} />
              </>
            )}
          </div>
        )}

        {/* 선택된 주소 미리보기 */}
        {isFormValid && (
          <div className="mb-6 p-4 bg-white rounded-[20px] shadow-sm border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">선택한 동네</p>
            <p className="text-lg font-bold text-gray-800">
              {hasDongs
                ? `${selectedCity} ${selectedDistrict} ${selectedDong}`
                : `${selectedCity} ${selectedDistrict}`}
            </p>
          </div>
        )}

        {/* 출발 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full h-[56px] text-lg font-bold rounded-[28px] shadow-lg transition-all ${
            isFormValid
              ? 'bg-[#4CAF50] text-white hover:bg-[#45a049] cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          탐험 출발! 🚀
        </button>
      </div>
    </motion.div>
  );
}
