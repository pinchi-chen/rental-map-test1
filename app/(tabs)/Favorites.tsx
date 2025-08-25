// ✅ app/tabs/Favorites.tsx
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { FAVS_KEY } from '../constants/storageKeys'; // ⬅️ 自己新增
import properties from '../data/properties'; // ⬅️ 這要是 default export
import { getJSON } from '../lib/storage'; // ⬅️ 確認這裡的路徑符合你的專案結構
// 加上 property 資料的型別定義（你可以根據你實際資料修改）
type Property = {
  id: string;
  name: string;
  address: string;
};

const Favorites = () => {
  const [favList, setFavList] = useState<Property[]>([]);
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    const fetchFavorites = async () => {
      const favIds: string[] = await getJSON(FAVS_KEY, []);
      const matched = properties.filter((p: Property) => favIds.includes(p.id));
      setFavList(matched);
    };
    const unsubscribe = navigation.addListener('focus', fetchFavorites);
    return unsubscribe;
  }, [navigation]);

  const goToDetail = (id: string) => {
    // 這裡要注意用的是 'property/[id]' 還是 'property/[id].tsx'
    // expo-router 通常是 'property/[id]'
    router.push({
      pathname: '/property/[id]',
      params: { id },
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>收藏清單</Text>
      <FlatList
        data={favList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => goToDetail(item.id)}
            style={{ padding: 12, borderBottomColor: '#ccc', borderBottomWidth: 1 }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text style={{ color: '#666' }}>{item.address}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Favorites;
