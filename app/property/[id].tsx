// app/property/[id].tsx
import { Link, useLocalSearchParams } from 'expo-router';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_PROPERTIES } from '../data/properties'; // 若報錯就改成 '../../data/properties'

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = MOCK_PROPERTIES.find(x => x.id === id);

  if (!p) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>找不到此物件</Text>
        <Link href="/" asChild><Button title="回地圖" onPress={() => {}} /></Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 8 }}>
        <Text style={styles.title}>{p.name}</Text>
        <Text style={styles.item}>地址：{p.address}</Text>
        <Text style={styles.item}>價位：{p.priceMin ?? '-'} ~ {p.priceMax ?? '-'}</Text>
        <Text style={styles.item}>平均評分：{p.avgRating ?? 'N/A'}</Text>
        {p.tags?.length ? <Text style={styles.item}>標籤：{p.tags.join('、')}</Text> : null}
        <View style={{ height: 16 }} />
        <Link href="/" asChild><Button title="回地圖" onPress={() => {}} /></Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  item: { color: '#ddd', fontSize: 16 },
});
