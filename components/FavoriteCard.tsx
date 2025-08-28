// components/FavoriteCard.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Property } from '../app/data/properties';

type Props = {
  property: Property;
  avg: number | null;           // 即時平均分數（可能為 null 代表尚無評論）
  onRemove?: () => void;        // 收藏頁可直接取消收藏
};

export default function FavoriteCard({ property, avg, onRemove }: Props) {
  const router = useRouter();
  const desc = (typeof avg === 'number' && !Number.isNaN(avg))
    ? `評分 ${avg}★`
    : '尚無評論';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/property/${property.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{property.name}</Text>
        <Text style={styles.addr} numberOfLines={1}>{property.address}</Text>
        <Text style={styles.rating}>{desc}</Text>
      </View>

      {onRemove ? (
        <Pressable style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeTxt}>取消收藏</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '800' },
  addr: { color: '#666', marginTop: 2 },
  rating: { marginTop: 6, fontWeight: '700', color: '#333' },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  removeTxt: { color: '#fff', fontWeight: '700' },
});
