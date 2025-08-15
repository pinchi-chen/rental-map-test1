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
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: '元智A社區',
    address: '桃園市中壢區某路 1 號',
    lat: 24.9693,
    lng: 121.2632,
    priceMin: 8000,
    priceMax: 12000,
    avgRating: 4.2,
    tags: ['套房', '電梯'],
  },
  {
    id: 'p2',
    name: '元智B公寓',
    address: '桃園市中壢區某路 2 號',
    lat: 24.9701,
    lng: 121.2619,
    priceMin: 7000,
    priceMax: 11000,
    avgRating: 3.8,
    tags: ['雅房', '近學校'],
  },
  {
    id: 'p3',
    name: '元智C套房',
    address: '桃園市中壢區某路 3 號',
    lat: 24.9685,
    lng: 121.2641,
    priceMin: 9000,
    priceMax: 13000,
    avgRating: 4.5,
    tags: ['套房', '可養寵物'],
  },
];
