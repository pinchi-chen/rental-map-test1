// app/favorites.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import FavoriteCard from '../../components/FavoriteCard';
import { MOCK_PROPERTIES, Property } from '../data/properties';
import { getAverageRating } from '../lib/comments';
import { getJSON, setJSON } from '../lib/storage';

const FAVS_KEY = 'favs:v1';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});

  const load = useCallback(async () => {
    // 1) 取出收藏 ID
    const ids = await getJSON<string[]>(FAVS_KEY, []);
    // 2) 對應成房源資料
    const favProps = MOCK_PROPERTIES.filter(p => ids.includes(p.id));
    setFavorites(favProps);
    // 3) 逐筆取平均分數（先讀快取，沒有就從評論計算）
    const pairs: [string, number | null][] = await Promise.all(
      favProps.map(async (p) => [p.id, await getAverageRating(p.id)] as [string, number | null])
    );
    setRatings(Object.fromEntries(pairs));
  }, []);

  // 回到這個頁面就重新載入，確保分數是最新的
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 在收藏頁直接取消收藏
  const remove = useCallback(async (id: string) => {
    const ids = await getJSON<string[]>(FAVS_KEY, []);
    const nextIds = ids.filter(x => x !== id);
    await setJSON(FAVS_KEY, nextIds);
    setFavorites(prev => prev.filter(p => p.id !== id));
    setRatings(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>你尚未收藏任何房源</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => (
        <FavoriteCard
          property={item}
          avg={ratings[item.id] ?? null}
          onRemove={() => remove(item.id)}
        />
      )}
    />
  );
}
