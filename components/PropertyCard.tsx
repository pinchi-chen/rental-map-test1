// components/PropertyCard.tsx
import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Property } from '../app/data/properties';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property.id}`} asChild>
      <View style={styles.card}>
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{property.name}</Text>
          <Text style={styles.address}>{property.address}</Text>
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  address: {
    color: '#666',
    marginTop: 4,
  },
});