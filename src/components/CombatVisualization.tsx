import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CombatAction, AttackType } from '../types';
import { SoundService } from '../services/soundService';

interface CombatVisualizationProps {
  actions: CombatAction[];
  onComplete?: () => void;
}

const { width } = Dimensions.get('window');

export const CombatVisualization: React.FC<CombatVisualizationProps> = ({
  actions,
  onComplete,
}) => {
  const theme = useTheme();
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [animations] = useState({
    damage: new Animated.Value(0),
    opacity: new Animated.Value(1),
  });

  useEffect(() => {
    if (currentActionIndex < actions.length) {
      playActionAnimation(actions[currentActionIndex]);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentActionIndex]);

  const playActionAnimation = async (action: CombatAction) => {
    // Reset animations
    animations.damage.setValue(0);
    animations.opacity.setValue(1);

    // Play sound effect
    await SoundService.playCombatSound(action.type);

    // Play damage number animation
    Animated.sequence([
      Animated.timing(animations.damage, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animations.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentActionIndex(prev => prev + 1);
    });
  };

  const getAttackColor = (type: AttackType) => {
    switch (type) {
      case 'basic':
        return '#4CAF50';
      case 'special':
        return '#2196F3';
      case 'ultimate':
        return '#F44336';
      default:
        return theme.colors.text;
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'encounter':
        return '👾';
      case 'miniBoss':
        return '👹';
      case 'boss':
        return '👑';
      default:
        return '🎯';
    }
  };

  if (currentActionIndex >= actions.length) {
    return null;
  }

  const currentAction = actions[currentActionIndex];
  const damageScale = animations.damage.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.5],
  });
  const damageOpacity = animations.damage.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.targetContainer}>
        <Text style={[styles.targetIcon, { color: theme.colors.text }]}>
          {getTargetIcon(currentAction.target)}
        </Text>
        <Text style={[styles.targetName, { color: theme.colors.text }]}>
          {currentAction.target}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.damageContainer,
          {
            transform: [{ scale: damageScale }],
            opacity: damageOpacity,
          },
        ]}
      >
        <Text
          style={[
            styles.damageText,
            { color: getAttackColor(currentAction.type) },
          ]}
        >
          {Math.round(currentAction.damage)}
        </Text>
        <Text
          style={[
            styles.attackType,
            { color: getAttackColor(currentAction.type) },
          ]}
        >
          {currentAction.type.toUpperCase()}
        </Text>
      </Animated.View>
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
  targetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  targetName: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  damageContainer: {
    alignItems: 'center',
  },
  damageText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  attackType: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
}); 