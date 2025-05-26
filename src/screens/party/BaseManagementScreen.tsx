import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BaseService } from '../../services/baseService';
import { PartyBase, BaseType } from '../../types';
import { colors, spacing, typography } from '../../theme';

interface RouteParams {
  baseId: string;
  isPartyLeader: boolean;
}

export const BaseManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { baseId, isPartyLeader } = route.params as RouteParams;
  const [base, setBase] = useState<PartyBase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPartyLeader) {
      Alert.alert('Access Denied', 'Only party leaders can access base management');
      navigation.goBack();
      return;
    }
    loadBase();
  }, []);

  const loadBase = async () => {
    try {
      const baseData = await BaseService.getBase(baseId);
      setBase(baseData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load base data');
    } finally {
      setLoading(false);
    }
  };

  const handleBaseTypeChange = async (newType: BaseType) => {
    try {
      await BaseService.updateBaseType(baseId, newType);
      loadBase();
      Alert.alert('Success', 'Base type updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update base type');
    }
  };

  const handleBaseNameChange = async (newName: string) => {
    try {
      await BaseService.updateBaseName(baseId, newName);
      loadBase();
      Alert.alert('Success', 'Base name updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update base name');
    }
  };

  const handleUpgradeBase = async () => {
    try {
      await BaseService.upgradeBase(baseId);
      loadBase();
      Alert.alert('Success', 'Base upgraded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade base');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!base) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Base not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Current Type:</Text>
          <Text style={styles.value}>{base.type}</Text>
          <Text style={styles.label}>Level:</Text>
          <Text style={styles.value}>{base.level}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Base Type</Text>
        <View style={styles.typeGrid}>
          {(['tavern', 'inn', 'shop', 'house'] as BaseType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                base.type === type && styles.selectedType,
              ]}
              onPress={() => handleBaseTypeChange(type)}
            >
              <Text style={[
                styles.typeText,
                base.type === type && styles.selectedTypeText,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upgrade Base</Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgradeBase}
        >
          <Text style={styles.upgradeButtonText}>
            Upgrade to Level {base.level + 1}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Coming Soon</Text>
          <Text style={styles.premiumText}>
            Premium features will include:
          </Text>
          <Text style={styles.premiumFeature}>• Custom base themes</Text>
          <Text style={styles.premiumFeature}>• Advanced room layouts</Text>
          <Text style={styles.premiumFeature}>• Special effects and animations</Text>
          <Text style={styles.premiumFeature}>• Exclusive customization items</Text>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  typeButton: {
    width: '48%',
    margin: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: colors.primary,
  },
  typeText: {
    ...typography.body1,
    color: colors.text,
  },
  selectedTypeText: {
    color: colors.text,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    ...typography.body1,
    color: colors.text,
  },
  premiumCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
  },
  premiumTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  premiumText: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  premiumFeature: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.body1,
    color: colors.text,
  },
}); 