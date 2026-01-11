export interface Quiz {
  id: string;
  category: 'heat' | 'flood' | 'landslide' | 'carbon' | 'green';
  categoryName: string;
  emoji: string;
  intro: string;
  question: string;
  answer: boolean; // true = O, false = X
  explanation: string;
}

export const quizzes: Quiz[] = [
  // 폭염 관련 (2문제)
  {
    id: 'quiz01',
    category: 'heat',
    categoryName: '폭염',
    emoji: '☀️',
    intro: '폭염은 아주 더운 날씨예요!',
    question: '여름에 공원이 많은 동네는 그렇지 않은 동네보다 시원해요',
    answer: true,
    explanation: '맞았어요! 나무와 풀이 많으면 그늘도 생기고 공기도 시원해져요.',
  },
  {
    id: 'quiz02',
    category: 'heat',
    categoryName: '폭염',
    emoji: '☀️',
    intro: '폭염은 아주 더운 날씨예요!',
    question: '더운 여름날 아스팔트 도로는 풀밭보다 더 뜨거워요',
    answer: true,
    explanation: '맞았어요! 아스팔트는 햇빛을 받으면 아주 뜨거워지지만, 풀밭은 물을 머금어서 덜 뜨거워요.',
  },
  // 홍수 관련 (2문제)
  {
    id: 'quiz03',
    category: 'flood',
    categoryName: '홍수',
    emoji: '💧',
    intro: '홍수는 물이 너무 많이 불어나는 거예요!',
    question: '비가 많이 오면 콘크리트가 많은 곳보다 흙이 많은 곳이 더 잘 물을 흡수해요',
    answer: true,
    explanation: '맞았어요! 흙은 물을 쏙쏙 흡수하지만 콘크리트는 물이 그냥 흘러가요.',
  },
  {
    id: 'quiz04',
    category: 'flood',
    categoryName: '홍수',
    emoji: '💧',
    intro: '홍수는 물이 너무 많이 불어나는 거예요!',
    question: '장마철에는 강 근처보다 산 위가 더 위험해요',
    answer: false,
    explanation: '아니에요! 장마철에는 강물이 넘칠 수 있어서 강 근처가 더 위험해요.',
  },
  // 산사태 관련 (1문제)
  {
    id: 'quiz05',
    category: 'landslide',
    categoryName: '산사태',
    emoji: '⛰️',
    intro: '산사태는 산의 흙이 미끄러져 내려오는 거예요!',
    question: '나무가 많은 산은 비가 와도 흙이 잘 무너지지 않아요',
    answer: true,
    explanation: '맞았어요! 나무 뿌리가 흙을 꽉 잡아줘서 산사태를 막아줘요.',
  },
  // 탄소배출 관련 (1문제)
  {
    id: 'quiz06',
    category: 'carbon',
    categoryName: '탄소',
    emoji: '🚗',
    intro: '탄소는 지구를 더워지게 만들어요!',
    question: '자동차보다 자전거를 타면 지구가 더 건강해져요',
    answer: true,
    explanation: '맞았어요! 자전거는 나쁜 공기를 만들지 않아서 지구에 좋아요.',
  },
  // 녹지 관련 (1문제)
  {
    id: 'quiz07',
    category: 'green',
    categoryName: '녹지',
    emoji: '🌳',
    intro: '녹지는 나무와 풀이 있는 곳이에요!',
    question: '도시에 공원이 많으면 공기가 더 깨끗해져요',
    answer: true,
    explanation: '맞았어요! 나무와 풀이 나쁜 공기를 깨끗하게 만들어줘요.',
  },
];
