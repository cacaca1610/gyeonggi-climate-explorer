export interface Character {
  id: string;
  name: string;
  emoji: string;
  description: string;
  detail: string;
  power: string;
  greeting: string;
  correctPhrases: string[];
  wrongPhrases: string[];
  personality: string;
}

export const characters: Character[] = [
  {
    id: 'sun',
    name: '햇빛이',
    emoji: '🌞',
    description: '밝고 에너지 넘치는 햇빛이',
    detail: '언제나 활기차고 따뜻해요! 폭염도 두렵지 않은 용감한 친구랍니다!',
    power: '폭염 전문가',
    greeting: '안녕! 난 햇빛이야! 함께 기후 탐험을 떠나볼까? 빛나게! ✨',
    correctPhrases: [
      '와! 정말 잘했어! 반짝반짝! ✨',
      '역시! 넌 정말 똑똑해! 빛이 나는걸? 🌟',
      '완벽해! 햇살처럼 밝은 답이야! ☀️',
    ],
    wrongPhrases: [
      '괜찮아! 다음엔 더 밝게 빛날 거야! 💪',
      '실수는 배움의 시작이야! 다시 도전! 🌤️',
      '조금만 더 생각해보자! 넌 할 수 있어! ⭐',
    ],
    personality: '활발하고 긍정적인 성격',
  },
  {
    id: 'water',
    name: '물방울이',
    emoji: '💧',
    description: '맑고 시원한 물방울이',
    detail: '차분하고 똑똑해요. 물처럼 유연하게 문제를 해결하는 친구예요!',
    power: '홍수 전문가',
    greeting: '안녕~ 나는 물방울이야. 차근차근 함께 배워보자! 촉촉~ 💙',
    correctPhrases: [
      '정답이야! 물흐르듯 자연스러웠어! 💧',
      '멋져! 깨끗한 물처럼 완벽해! 🌊',
      '잘했어! 시원하게 맞췄네! ✨',
    ],
    wrongPhrases: [
      '괜찮아~ 물처럼 다시 흘러가보자! 💙',
      '실수도 배움이야. 차분하게 다시! 🌈',
      '조금 아쉽지만, 넌 잘하고 있어! 💧',
    ],
    personality: '차분하고 지혜로운 성격',
  },
  {
    id: 'tree',
    name: '나무지기',
    emoji: '🌳',
    description: '든든하고 믿음직한 나무지기',
    detail: '느긋하지만 강해요! 깊은 뿌리처럼 단단한 지식을 가진 친구예요!',
    power: '녹지 전문가',
    greeting: '안녕! 나는 나무지기야~ 천천히 뿌리 깊게 배워보자! 🌿',
    correctPhrases: [
      '훌륭해! 뿌리 깊은 지식이네! 🌳',
      '잘했어! 나무처럼 튼튼한 답이야! 💚',
      '완벽해! 숲처럼 풍성한 지혜로구나! 🌲',
    ],
    wrongPhrases: [
      '괜찮아~ 나무도 천천히 자라잖아! 🌱',
      '실수는 성장의 거름이야! 다시 도전! 🌿',
      '조금 아쉽지만, 넌 잘 자라고 있어! 🌳',
    ],
    personality: '느긋하고 든든한 성격',
  },
];
