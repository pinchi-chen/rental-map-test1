// app/property/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MOCK_PROPERTIES, Property } from '../data/properties'; // ← 如果你的型別在 app/data/properties.ts，路徑改成 '../data/properties'
import { getJSON, setJSON } from '../lib/storage';

type Comment = {
  id: string;
  user: string;
  rating: number; // 1~5
  text: string;
  createdAt: number;
};

const FAVS_KEY = 'favs:v1';
const commentsKey = (pid: string) => `comments:${pid}`;

export default function PropertyDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const property: Property | undefined = useMemo(
    () => MOCK_PROPERTIES.find((p) => p.id === id),
    [id]
  );

  const [favs, setFavs] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState('訪客');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const fs = await getJSON<string[]>(FAVS_KEY, []);
      setFavs(fs);
      if (id) {
        setComments(await getJSON<Comment[]>(commentsKey(id), []));
      }
    })();
  }, [id]);

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>找不到這筆資料</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>返回</Text>
        </Pressable>
      </View>
    );
  }

  const isFav = favs.includes(property.id);

  const toggleFav = async () => {
    const next = isFav ? favs.filter((x) => x !== property.id) : [...favs, property.id];
    setFavs(next);
    await setJSON(FAVS_KEY, next);
  };

  const submitComment = async () => {
    if (!text.trim()) {
      Alert.alert('請輸入評論內容');
      return;
    }
    const c: Comment = {
      id: `${Date.now()}`,
      user: user.trim() || '訪客',
      rating,
      text: text.trim(),
      createdAt: Date.now(),
    };
    const next = [c, ...comments];
    setComments(next);
    setText('');
    setRating(5);
    await setJSON(commentsKey(property.id), next);
  };

  const avgFromComments =
    comments.length === 0
      ? undefined
      : Math.round(
          (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length) * 10
        ) / 10;

  const displayAvg = avgFromComments ?? property.avgRating ?? 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Image
        style={styles.cover}
        source={{
          uri:
            property.imageUrl ||
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
        }}
      />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{property.name}</Text>
          <Text style={styles.muted}>{property.address}</Text>
          <Text style={styles.muted}>
            平均評分：{displayAvg} ★（{comments.length} 則評論）
          </Text>
        </View>

        <Pressable
          onPress={toggleFav}
          style={[styles.favBtn, isFav && { backgroundColor: '#ff595e' }]}
        >
          <Text style={styles.favBtnText}>{isFav ? '❤️ 已收藏' : '🤍 收藏'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>基本資料</Text>
        <Text style={styles.row}>最低租金：{property.priceMin ?? '-'} /月</Text>
        <Text style={styles.row}>最高租金：{property.priceMax ?? '-'} /月</Text>
        <Text style={styles.row}>
          標籤：{property.tags?.length ? property.tags.join('、') : '無'}
        </Text>
      </View>

      {/* 你原本的導航/距離按鈕可以放在這個卡片下方（略） */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>新增評論</Text>

        <Text style={styles.label}>暱稱</Text>
        <TextInput
          value={user}
          onChangeText={setUser}
          placeholder="你的暱稱"
          style={styles.input}
        />

        <Text style={styles.label}>評分（點選星星）</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((v) => (
            <Pressable key={v} onPress={() => setRating(v)}>
              <Text style={{ fontSize: 26, marginRight: 6 }}>
                {v <= rating ? '⭐' : '☆'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>評論內容</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="寫點什麼..."
          style={[styles.input, { height: 90 }]}
          multiline
        />

        <Pressable style={styles.btn} onPress={submitComment}>
          <Text style={styles.btnText}>送出評論</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>近期評論</Text>
        {comments.length === 0 ? (
          <Text style={styles.muted}>尚無評論</Text>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: '700' }}>
                {c.user}　{Array.from({ length: c.rating })
                  .map(() => '⭐')
                  .join('')}
              </Text>
              <Text style={styles.mutedSmall}>
                {new Date(c.createdAt).toLocaleString()}
              </Text>
              <Text style={{ lineHeight: 20 }}>{c.text}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 220, backgroundColor: '#eee' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  muted: { color: '#666', marginTop: 3 },
  mutedSmall: { color: '#888', fontSize: 12, marginBottom: 4 },
  favBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  favBtnText: { color: 'white', fontWeight: '700' },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  row: { marginBottom: 4 },
  label: { marginTop: 8, marginBottom: 6, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#2f80ed',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
