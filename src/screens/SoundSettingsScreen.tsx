import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { SoundService } from '../services/soundService';

export const SoundSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      setIsMuted(SoundService.isSoundMuted());
      setVolume(SoundService.getVolume());
      setIsPreloaded(SoundService.getPreloadStatus());
    } catch (error) {
      console.error('Error loading sound settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuteToggle = async (value: boolean) => {
    setIsMuted(value);
    SoundService.setMuted(value);
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    await SoundService.setVolume(value);
  };

  const handlePreloadSounds = async () => {
    setIsLoading(true);
    try {
      await SoundService.loadSounds();
      setIsPreloaded(true);
    } catch (error) {
      console.error('Error preloading sounds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Sound Settings
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Mute All Sounds
          </Text>
          <Switch
            value={isMuted}
            onValueChange={handleMuteToggle}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={isMuted ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Volume
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor="#767577"
            thumbTintColor={theme.colors.primary}
            disabled={isMuted}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.preloadButton,
            {
              backgroundColor: isPreloaded ? '#4CAF50' : theme.colors.primary,
            },
          ]}
          onPress={handlePreloadSounds}
          disabled={isPreloaded}
        >
          <Text style={styles.preloadButtonText}>
            {isPreloaded ? 'Sounds Preloaded' : 'Preload All Sounds'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Sound Effects
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
          • Combat sounds for different attack types{'\n'}
          • Reward sounds for XP, gold, and items{'\n'}
          • Achievement and level-up sounds
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  slider: {
    width: 200,
    height: 40,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  preloadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  preloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 