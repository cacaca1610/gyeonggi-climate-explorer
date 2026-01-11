export interface Shelter {
  name: string;
  address: string;
  distance: string;
}

export const sheltersData: Record<string, Shelter[]> = {
  '수원시 장안구 파장동': [
    { name: '파장동 주민센터', address: '수원시 장안구 파장동 123', distance: '200m' },
    { name: '파장공원 쉼터', address: '수원시 장안구 파장동 456', distance: '350m' },
  ],
  '수원시 영통구 영통동': [
    { name: '영통동 행정복지센터', address: '수원시 영통구 영통동 789', distance: '180m' },
    { name: '영통중앙공원 쉼터', address: '수원시 영통구 영통동 321', distance: '420m' },
  ],
  '성남시 분당구 분당동': [
    { name: '분당동 주민센터', address: '성남시 분당구 분당동 567', distance: '250m' },
    { name: '중앙공원 그늘쉼터', address: '성남시 분당구 분당동 890', distance: '300m' },
  ],
  '용인시 수지구 풍덕천동': [
    { name: '풍덕천동 주민센터', address: '용인시 수지구 풍덕천동 234', distance: '150m' },
    { name: '수지체육공원 쉼터', address: '용인시 수지구 풍덕천동 678', distance: '380m' },
  ],
  '고양시 일산동구 백석동': [
    { name: '백석동 행정복지센터', address: '고양시 일산동구 백석동 901', distance: '220m' },
    { name: '일산호수공원 쉼터', address: '고양시 일산동구 백석동 432', distance: '500m' },
  ],
};

export const getShelters = (location: string): Shelter[] => {
  return sheltersData[location] || [
    { name: '가까운 주민센터', address: '문의: 지역 주민센터', distance: '-' },
    { name: '공원 쉼터', address: '가까운 공원을 이용하세요', distance: '-' },
  ];
};
