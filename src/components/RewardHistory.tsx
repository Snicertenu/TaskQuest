import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { firestore } from '../config/firebase';
import { Item } from '../types';

interface RewardHistoryItem {
  id: string;
  type: 'task' | 'achievement' | 'combat';
  sourceId: string;
  rewards: {
    xp: number;
    gold: number;
    items: Item[];
  };
  timestamp: Date;
}

export const RewardHistory: React.FC = () => {
  const theme = useTheme();
  const [rewards, setRewards] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'task' | 'achievement' | 'combat'>('all');

  useEffect(() => {
    loadRewards();
  }, [selectedType]);

  const loadRewards = async () => {
    setLoading(true);
    try {
      let query = firestore().collection('rewards').orderBy('timestamp', 'desc');
      
      if (selectedType !== 'all') {
        query = query.where('type', '==', selectedType);
      }

      const snapshot = await query.limit(50).get();
      const rewardData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as RewardHistoryItem[];

      setRewards(rewardData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📝';
      case 'achievement':
        return '🏆';
      case 'combat':
        return '⚔️';
      default:
        return '🎁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return '#4CAF50';
      case 'achievement':
        return '#FFC107';
      case 'combat':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  const renderFilterButton = (type: 'all' | 'task' | 'achievement' | 'combat', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedType === type ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={() => setSelectedType(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedType === type ? '#FFFFFF' : theme.colors.primary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRewardItem = ({ item }: { item: RewardHistoryItem }) => (
    <View style={[styles.rewardItem, { borderColor: theme.colors.border }]}>
      <View style={styles.rewardHeader}>
        <Text style={[styles.rewardType, { color: getTypeColor(item.type) }]}>
          {getTypeIcon(item.type)} {item.type.toUpperCase()}
        </Text>
        <Text style={[styles.rewardDate, { color: theme.colors.text + '80' }]}>
          {item.timestamp.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.rewardContent}>
        <View style={styles.rewardRow}>
          <Text style={[styles.rewardIcon, { color: theme.colors.primary }]}>⭐</Text>
          <Text style={[styles.rewardText, { color: theme.colors.text }]}>
            +{item.rewards.xp} XP
          </Text>
        </View>

        <View style={styles.rewardRow}>
          <Text style={[styles.rewardIcon, { color: '#FFD700' }]}>💰</Text>
          <Text style={[styles.rewardText, { color: theme.colors.text }]}>
            +{item.rewards.gold} Gold
          </Text>
        </View>

        {item.rewards.items.length > 0 && (
          <View style={styles.rewardRow}>
            <Text style={[styles.rewardIcon, { color: theme.colors.primary }]}>🎁</Text>
            <Text style={[styles.rewardText, { color: theme.colors.text }]}>
              {item.rewards.items.length} {item.rewards.items.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('task', 'Tasks')}
        {renderFilterButton('achievement', 'Achievements')}
        {renderFilterButton('combat', 'Combat')}
      </View>

      <FlatList
        data={rewards}
        renderItem={renderRewardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  rewardItem: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  rewardType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardDate: {
    fontSize: 12,
  },
  rewardContent: {
    padding: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rewardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rewardText: {
    fontSize: 16,
  },
}); 