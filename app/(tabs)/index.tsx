// app/(tabs)/index.tsx
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_PROPERTIES } from '../data/properties'; // 若 data 在根目錄，改成 ../../data/properties

const INITIAL_REGION = {
  latitude: 24.9690,
  longitude: 121.2630,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, any>>({}); // 存每個 pin 的參考，用來顯示/關閉 callout

  // 位置 / 篩選 / 為了確保《全部》能把點帶回來
  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState(0);

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

  // 🎯 回到我（若還沒定位就先定位一次）
  function recenterToMe() {
    if (myCoords) {
      mapRef.current?.animateToRegion({ ...myCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    } else {
      locateMe();
    }
  }

  // 切換篩選（包含《全部》）：先把任何開著的泡泡關掉，再套用條件並強制重繪
  function applyFilter(val: number | null) {
    Object.values(markerRefs.current).forEach(m => m?.hideCallout?.());
    setMinRating(val);
    setMapKey(k => k + 1); // ← 讓《全部》一定把所有點復原
  }

  const filtered = useMemo(
    () => (minRating == null ? MOCK_PROPERTIES : MOCK_PROPERTIES.filter(p => (p.avgRating ?? 0) >= minRating)),
    [minRating]
  );

  // 篩選變動就自動框住目前顯示的點
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
          {filtered.map(p => (
            <Marker
              key={p.id}
              ref={(ref) => { markerRefs.current[p.id] = ref; }}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              title={p.name}                                   // 這兩行保留「原生白色泡泡」
              description={`評分 ${p.avgRating ?? 'N/A'}★`}
              // 點圖針 → 只打開泡泡（不直接跳頁）
              onPress={() => markerRefs.current[p.id]?.showCallout?.()}
              // 點泡泡 → 進詳情頁（保留你原本的功能）
              onCalloutPress={() => router.push(`/property/${p.id}`)}
            />
          ))}
        </MapView>

        {/* 上方工具列 */}
        <View style={styles.topBar}>
          <Text style={styles.title}>元智租屋地圖（MVP）</Text>
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
});
