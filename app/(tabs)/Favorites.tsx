// app/favorites.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import PropertyCard from '../../components/PropertyCard'; // 你顯示房源的元件
import { MOCK_PROPERTIES, Property } from '../data/properties';
import { getJSON } from '../lib/storage';

const FAVS_KEY = 'favs:v1';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Property[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const ids = await getJSON<string[]>(FAVS_KEY, []);
        const favProps = MOCK_PROPERTIES.filter((p) => ids.includes(p.id));
        setFavorites(favProps);
        console.log('讀取到收藏ID:', ids);
        console.log('對應的房源:', favProps);
      };
      load();
    }, [])
  );

  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>你尚未收藏任何房源</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PropertyCard property={item} />}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}
