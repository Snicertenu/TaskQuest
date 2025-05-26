import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Item } from '../types';
import { SoundService } from '../services/soundService';

interface RewardDisplayProps {
  xp: number;
  gold: number;
  items: Item[];
  onComplete?: () => void;
}

export const RewardDisplay: React.FC<RewardDisplayProps> = ({
  xp,
  gold,
  items,
  onComplete,
}) => {
  const theme = useTheme();
  const [animations] = useState({
    xp: new Animated.Value(0),
    gold: new Animated.Value(0),
    items: new Animated.Value(0),
  });

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(animations.xp, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animations.gold, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animations.items, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const playSoundSequence = async () => {
      await SoundService.playRewardSound('xp');
      await new Promise(resolve => setTimeout(resolve, 500));
      await SoundService.playRewardSound('gold');
      if (items.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await SoundService.playRewardSound('item');
      }
    };

    sequence.start(() => {
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    });

    playSoundSequence();
  }, []);

  const xpScale = animations.xp.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  const goldScale = animations.gold.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  const itemsScale = animations.items.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.rewardItem,
          {
            transform: [{ scale: xpScale }],
            opacity: animations.xp,
          },
        ]}
      >
        <Text style={[styles.rewardIcon, { color: theme.colors.primary }]}>⭐</Text>
        <Text style={[styles.rewardText, { color: theme.colors.text }]}>
          +{xp} XP
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.rewardItem,
          {
            transform: [{ scale: goldScale }],
            opacity: animations.gold,
          },
        ]}
      >
        <Text style={[styles.rewardIcon, { color: '#FFD700' }]}>💰</Text>
        <Text style={[styles.rewardText, { color: theme.colors.text }]}>
          +{gold} Gold
        </Text>
      </Animated.View>

      {items.length > 0 && (
        <Animated.View
          style={[
            styles.rewardItem,
            {
              transform: [{ scale: itemsScale }],
              opacity: animations.items,
            },
          ]}
        >
          <Text style={[styles.rewardIcon, { color: theme.colors.primary }]}>🎁</Text>
          <Text style={[styles.rewardText, { color: theme.colors.text }]}>
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 