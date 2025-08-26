// components/ui/FavoriteCard.tsx
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Property } from '../app/data/properties';

interface Props {
  property: Property;
  onRemove: (id: string) => void;
}

export default function FavoriteCard({ property, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{property.name}</Text>
        <Text style={styles.address}>{property.address}</Text>
      </View>
      <View style={styles.actions}>
        <FontAwesome name="star" size={16} color="orange" />
        <Text style={styles.rating}>{property.rating ?? '4.0'}</Text>
        <Pressable onPress={() => onRemove(property.id)}>
          <MaterialIcons name="delete" size={20} color="red" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  address: {
    color: '#666',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 14,
    color: '#444',
  },
});
