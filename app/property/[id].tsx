// app/property/[id].tsx
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_PROPERTIES } from '../data/properties'; // 若 data 在專案根目錄改成 ../../data/properties

type Coords = { latitude: number; longitude: number };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = useMemo(() => MOCK_PROPERTIES.find(x => x.id === id), [id]);

  // 取使用者現在位置算距離（可選）
  const [my, setMy] = useState<Coords | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLoc(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMy({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (e) {
        // 靜默失敗即可
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  if (!p) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: '#fff' }}>找不到此物件</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>← 返回</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const distanceText = my ? formatDistance(haversine(my, { latitude: p.lat, longitude: p.lng })) : (loadingLoc ? '計算距離中…' : '—');
  const img = p.imageUrl ?? `https://picsum.photos/seed/${encodeURIComponent(p.id)}/1200/800`;

  function openInMaps() {
    const lat = p.lat;
    const lng = p.lng;
    const qName = encodeURIComponent(p.name);
    // iOS 優先 Apple Maps；Android 用 geo URI；最後用 Google Maps 網址
    const apple = `http://maps.apple.com/?q=${qName}&ll=${lat},${lng}&daddr=${lat},${lng}`;
    const geo = `geo:${lat},${lng}?q=${lat},${lng}(${qName})`;
    const web = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const url = Platform.select({ ios: apple, android: geo, default: web })!;
    Linking.openURL(url);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={{ flex: 1, backgroundColor: '#0b0b0b' }}>
        {/* 置頂大圖 */}
        <Image source={{ uri: img }} style={styles.cover} />

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
          {/* 標題區 */}
          <View style={{ gap: 6 }}>
            <Text style={styles.title}>{p.name}</Text>
            <Text style={styles.sub}>{p.address ?? '地址未提供'}</Text>
            <Text style={styles.meta}>
              評分：{p.avgRating ?? 'N/A'}★　{my ? `距離：${distanceText}` : loadingLoc ? '距離：計算中…' : '距離：—'}
            </Text>
          </View>

          {/* 快速動作 */}
          <View style={styles.actionsRow}>
            <Pressable style={styles.action} onPress={openInMaps}>
              <Text style={styles.actionText}>🧭 導航</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => router.back()}>
              <Text style={styles.actionText}>← 返回地圖</Text>
            </Pressable>
          </View>

          {/* 基本資訊卡 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>基本資訊</Text>
            <Text style={styles.cardText}>名稱：{p.name}</Text>
            <Text style={styles.cardText}>地址：{p.address ?? '—'}</Text>
            <Text style={styles.cardText}>評分：{p.avgRating ?? '—'}★</Text>
            {'priceMin' in p || 'priceMax' in p ? (
              <Text style={styles.cardText}>參考租金：{p.priceMin ?? '-'} ~ {p.priceMax ?? '-'} / 月</Text>
            ) : null}
          </View>

          {/* 評論（假資料 or 你之後串後端） */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>近期評論</Text>
            {(p.comments ?? []).length === 0 ? (
              <Text style={styles.cardTextMuted}>尚無評論</Text>
            ) : (
              (p.comments ?? []).map((c: any) => (
                <View key={c.id} style={{ marginBottom: 10 }}>
                  <Text style={styles.cardText}>
                    <Text style={{ fontWeight: '700' }}>{c.user ?? '訪客'}</Text>・{c.rating ?? 'N/A'}★
                  </Text>
                  <Text style={styles.cardTextMuted}>{c.text}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ===== Helpers ===== */

function haversine(a: Coords, b: Coords) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa =
    s1 * s1 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(aa)); // meters
}
function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} 公尺` : `${(m / 1000).toFixed(1)} 公里`;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#0b0b0b', alignItems: 'center', justifyContent: 'center', gap: 16 },
  cover: { width: '100%', height: 220, backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: '#cfcfcf' },
  meta: { color: '#bbb', marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  action: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: '#2b2b2b' },
  actionText: { color: '#fff', fontWeight: '700' },

  card: { padding: 12, borderRadius: 12, backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', gap: 6 },
  cardTitle: { color: '#fff', fontWeight: '800', marginBottom: 4 },
  cardText: { color: '#ddd' },
  cardTextMuted: { color: '#9a9a9a' },

  btn: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#222', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});
