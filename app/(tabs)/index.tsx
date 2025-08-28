// app/(tabs)/index.tsx
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_PROPERTIES } from '../data/properties';
import { getAverageRating } from '../lib/comments';

const INITIAL_REGION = {
  latitude: 24.9690,
  longitude: 121.2630,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, any>>({});

  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [avgRatings, setAvgRatings] = useState<Record<string, number>>({});

  async function locateMe() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要定位權限', '請到系統設定開啟此 App 的定位權限。');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setHasLocation(true);
      setMyCoords(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    } catch (e) {
      console.log('locateMe error:', e);
      Alert.alert('定位失敗', '請稍後再試或檢查定位設定。');
    }
  }

  function recenterToMe() {
    if (myCoords) {
      mapRef.current?.animateToRegion({ ...myCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    } else {
      locateMe();
    }
  }

  function applyFilter(val: number | null) {
    Object.values(markerRefs.current).forEach(m => m?.hideCallout?.());
    setMinRating(val);
    setMapKey(k => k + 1);
  }

  // 用「真實平均」來做篩選（沒有評論的就不會進 ≥3★/≥4★）
  const filtered = useMemo(() => {
    const base = minRating == null
      ? MOCK_PROPERTIES
      : MOCK_PROPERTIES.filter(p => (avgRatings[p.id] ?? 0) >= minRating);

    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      (p.tags?.some(tag => tag.toLowerCase().includes(q)))
    );
  }, [minRating, searchQuery, avgRatings]);

  // 專門載入所有房源的平均分數
  const loadAllAverages = useCallback(async () => {
    const ratings: Record<string, number> = {};
    for (const p of MOCK_PROPERTIES) {
      // 先嘗試快取，沒有再用評論算
      const avg = await getAverageRating(p.id);
      if (avg != null) ratings[p.id] = avg;
      // （可選）你也可以直接從評論算：
      // const list = await getJSON<Comment[]>(commentsKey(p.id), []);
      // if (list.length) { ...計算並寫入 ratings... }
    }
    setAvgRatings(ratings);
    // console.log('avgRatings loaded:', ratings);
  }, []);

  // 重點：回到這個頁面時重新載入（避免停在舊值）
  useFocusEffect(
    useCallback(() => {
      loadAllAverages();
    }, [loadAllAverages])
  );

  // 頁面初次載入也跑一次
  useEffect(() => {
    loadAllAverages();
  }, [loadAllAverages]);

  // 篩選變動就重新框住顯示點位
  useEffect(() => {
    if (!mapRef.current) return;
    const coords = filtered.map(p => ({ latitude: p.lat, longitude: p.lng }));
    if (coords.length) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 60, bottom: 80, left: 60 },
        animated: true,
      });
    } else {
      mapRef.current.animateToRegion(INITIAL_REGION, 500);
    }
  }, [filtered.length]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          key={mapKey}
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={INITIAL_REGION}
          showsUserLocation={hasLocation}
        >
          {filtered.map(p => {
            const avg = avgRatings[p.id];
            const desc = (typeof avg === 'number' && !Number.isNaN(avg))
              ? `評分 ${avg}★`
              : '尚無評論';
            return (
              <Marker
                key={p.id}
                ref={(ref) => { markerRefs.current[p.id] = ref; }}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.name}
                description={desc}
                onPress={() => markerRefs.current[p.id]?.showCallout?.()}
                onCalloutPress={() => router.push(`/property/${p.id}`)}
              />
            );
          })}
        </MapView>

        {/* 上方工具列 */}
        <View style={styles.topBar}>
          <Text style={styles.title}>元智租屋地圖</Text>
          <TextInput
            placeholder="搜尋名稱、地址、標籤"
            placeholderTextColor="#ccc"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.row}>
            <View style={styles.filters}>
              <Pressable style={styles.chip} onPress={() => applyFilter(null)}>
                <Text style={styles.chipText}>全部</Text>
              </Pressable>
              <Pressable style={styles.chip} onPress={() => applyFilter(3)}>
                <Text style={styles.chipText}>≥3★</Text>
              </Pressable>
              <Pressable style={styles.chip} onPress={() => applyFilter(4)}>
                <Text style={styles.chipText}>≥4★</Text>
              </Pressable>
            </View>
            <Pressable onPress={recenterToMe} style={styles.btn}>
              <Text style={styles.btnText}>🎯 回到我</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 12, left: 12, right: 12,
    padding: 10, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.85)',
    gap: 8, zIndex: 20, elevation: 20,
  },
  title: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filters: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  chipText: { color: '#fff' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#111' },
  btnText: { color: '#fff', fontWeight: '700' },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: 'white',
  },
});
