// data/properties.ts

export type Property = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priceMin?: number;
  priceMax?: number;
  avgRating?: number;
  tags?: string[];
  imageUrl?: string;
  rating?: number;
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: '集聖樓',
    address: '桃園市中壢區興仁路二段27巷10號',
    lat: 24.967972301235466, 
    lng: 121.26349479365886,
    priceMin: 4000,
    priceMax: 6000,
    avgRating: 4.2,
    tags: ['套房', '電梯'],
   
  },
  {
    id: 'p2',
    name: '元智大富翁',
    address: '桃園市中壢區興安一街36號',
    lat: 24.96679151328128, 
    lng: 121.26463898016613,
    priceMin: 7000,
    priceMax: 10000,
    avgRating: 3.8,
    tags: ['套房', '有門禁'],
  },
  {
    id: 'p3',
    name: '元智生活會館',
    address: '桃園市中壢區興仁路二段99號',
    lat: 24.966763808238433, 
    lng: 121.26349222249459,
    priceMin: 9000,
    priceMax: 13000,
    avgRating: 4.5,
    tags: ['套房', '可養寵物'],
  },
];

const properties = MOCK_PROPERTIES;
export default properties;
