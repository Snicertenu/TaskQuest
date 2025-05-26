import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RoomLayoutService } from '../services/roomLayoutService';
import { RoomLayout, FurnitureItem } from '../types';
import { colors, spacing, typography } from '../theme';

interface Props {
  baseId: string;
  roomId: string;
  onLayoutUpdate?: (layout: RoomLayout) => void;
}

export const RoomLayoutEditor: React.FC<Props> = ({
  baseId,
  roomId,
  onLayoutUpdate,
}) => {
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [layoutData, furnitureData] = await Promise.all([
        RoomLayoutService.getRoomLayout(baseId, roomId),
        RoomLayoutService.getFurnitureItems(selectedCategory),
      ]);
      setLayout(layoutData);
      setFurnitureItems(furnitureData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load room layout data');
    } finally {
      setLoading(false);
    }
  };

  const handleFurnitureSelect = (item: FurnitureItem) => {
    setSelectedItem(item);
  };

  const handleFurniturePlace = async (x: number, y: number) => {
    if (!selectedItem || !layout) return;

    try {
      await RoomLayoutService.addFurnitureToLayout(baseId, roomId, {
        itemId: selectedItem.id,
        x,
        y,
        rotation: 0,
      });

      const updatedLayout = await RoomLayoutService.getRoomLayout(baseId, roomId);
      setLayout(updatedLayout);
      onLayoutUpdate?.(updatedLayout!);
      setSelectedItem(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to place furniture');
    }
  };

  const handleFurnitureRemove = async (furnitureId: string) => {
    try {
      await RoomLayoutService.removeFurnitureFromLayout(baseId, roomId, furnitureId);
      const updatedLayout = await RoomLayoutService.getRoomLayout(baseId, roomId);
      setLayout(updatedLayout);
      onLayoutUpdate?.(updatedLayout!);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove furniture');
    }
  };

  const handleFurnitureRotate = async (furnitureId: string) => {
    if (!layout) return;

    const furniture = layout.furniture.find(f => f.itemId === furnitureId);
    if (!furniture) return;

    try {
      await RoomLayoutService.updateFurniturePosition(baseId, roomId, furnitureId, {
        ...furniture,
        rotation: (furniture.rotation + 90) % 360,
      });

      const updatedLayout = await RoomLayoutService.getRoomLayout(baseId, roomId);
      setLayout(updatedLayout);
      onLayoutUpdate?.(updatedLayout!);
    } catch (error) {
      Alert.alert('Error', 'Failed to rotate furniture');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!layout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No layout found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.layoutContainer}>
        <View style={[styles.grid, { width: layout.width * 40, height: layout.height * 40 }]}>
          {layout.furniture.map(furniture => (
            <TouchableOpacity
              key={furniture.itemId}
              style={[
                styles.furnitureItem,
                {
                  left: furniture.x * 40,
                  top: furniture.y * 40,
                  transform: [{ rotate: `${furniture.rotation}deg` }],
                },
              ]}
              onLongPress={() => handleFurnitureRemove(furniture.itemId)}
              onPress={() => handleFurnitureRotate(furniture.itemId)}
            >
              <Image
                source={{ uri: furnitureItems.find(f => f.id === furniture.itemId)?.imageUrl }}
                style={styles.furnitureImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['common', 'rare', 'epic', 'legendary'].map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category as any)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {furnitureItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.furnitureButton,
                selectedItem?.id === item.id && styles.selectedFurniture,
              ]}
              onPress={() => handleFurnitureSelect(item)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.furnitureThumbnail}
              />
              <Text style={styles.furnitureName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: colors.text,
  },
  layoutContainer: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  furnitureItem: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  furnitureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  controls: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.body2,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.text,
  },
  furnitureButton: {
    width: 80,
    marginRight: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedFurniture: {
    backgroundColor: colors.primary,
  },
  furnitureThumbnail: {
    width: 60,
    height: 60,
    marginBottom: spacing.xs,
  },
  furnitureName: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
}); 