import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BaseService } from '../../services/baseService';
import { RoomCustomization } from '../../types';
import { colors, spacing, typography } from '../../theme';

interface RouteParams {
  baseId: string;
  memberId: string;
}

export const RoomDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { baseId, memberId } = route.params as RouteParams;
  const [customizations, setCustomizations] = useState<RoomCustomization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');

  useEffect(() => {
    loadRoomData();
  }, []);

  const loadRoomData = async () => {
    try {
      const [availableCustomizations, base] = await Promise.all([
        BaseService.getAvailableCustomizations('room', selectedCategory),
        BaseService.getBase(baseId),
      ]);

      setCustomizations(availableCustomizations);
      setIsPrivate(base?.rooms[memberId]?.isPrivate || false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyToggle = async (value: boolean) => {
    try {
      await BaseService.setRoomPrivacy(baseId, memberId, value);
      setIsPrivate(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update room privacy');
    }
  };

  const handleCustomizationSelect = async (customization: RoomCustomization) => {
    try {
      await BaseService.updateRoomCustomization(baseId, memberId, customization);
      Alert.alert('Success', 'Room customization updated');
      loadRoomData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update room customization');
    }
  };

  const renderCustomizationItem = (customization: RoomCustomization) => (
    <TouchableOpacity
      key={customization.id}
      style={styles.customizationCard}
      onPress={() => handleCustomizationSelect(customization)}
    >
      <Image
        source={{ uri: customization.imageUrl }}
        style={styles.customizationImage}
      />
      <View style={styles.customizationInfo}>
        <Text style={styles.customizationName}>{customization.name}</Text>
        <Text style={styles.customizationType}>{customization.type}</Text>
        <Text style={styles.customizationCost}>
          {customization.unlockCost} gold
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomTitle}>{memberId}'s Room</Text>
        <View style={styles.privacyToggle}>
          <Text style={styles.privacyLabel}>Private Room</Text>
          <Switch
            value={isPrivate}
            onValueChange={handlePrivacyToggle}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.categoryTabs}>
        {(['common', 'rare', 'epic', 'legendary'] as const).map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.activeCategoryTab,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customizationsList}>
        {customizations.map(renderCustomizationItem)}
      </View>
    </ScrollView>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  roomTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyLabel: {
    ...typography.body1,
    color: colors.text,
  },
  categoryTabs: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  categoryText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  activeCategoryText: {
    color: colors.primary,
  },
  customizationsList: {
    padding: spacing.md,
  },
  customizationCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  customizationImage: {
    width: 100,
    height: 100,
  },
  customizationInfo: {
    flex: 1,
    padding: spacing.md,
  },
  customizationName: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  customizationType: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  customizationCost: {
    ...typography.caption,
    color: colors.primary,
  },
}); 