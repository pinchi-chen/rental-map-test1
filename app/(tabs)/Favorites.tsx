// app/favorites.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteCard from '../../components/FavoriteCard';
import { MOCK_PROPERTIES, Property } from '../data/properties';
import { getAverageRating } from '../lib/comments';
import { getJSON, setJSON } from '../lib/storage';

const FAVS_KEY = 'favs:v1';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});

  const load = useCallback(async () => {
    const ids = await getJSON<string[]>(FAVS_KEY, []);
    const favProps = MOCK_PROPERTIES.filter(p => ids.includes(p.id));
    setFavorites(favProps);

    const pairs: [string, number | null][] = await Promise.all(
      favProps.map(async (p) => [p.id, await getAverageRating(p.id)] as [string, number | null])
    );
    setRatings(Object.fromEntries(pairs));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { paddingBottom: 16 }]}>
          <Text style={styles.headerTitle}>所有收藏地點</Text>
          <Text style={styles.countPill}>0</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>你尚未收藏任何房源</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>所有收藏地點</Text>
            <Text style={styles.countPill}>{favorites.length}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FavoriteCard
            property={item}
            avg={ratings[item.id] ?? null}
            onRemove={() => remove(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 讓內容不會貼齊上緣：Header 做出上方空白；List 再加下方 padding
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    paddingTop: 8,          // ← 往下推一點；已包含 SafeArea
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  countPill: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
