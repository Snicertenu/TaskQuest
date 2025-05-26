import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { RoomTheme, RoomThemeService } from '../services/roomThemeService';

interface RoomThemeSelectorProps {
  baseId: string;
  roomId: string;
  onThemeSelected?: (theme: RoomTheme) => void;
}

export const RoomThemeSelector: React.FC<RoomThemeSelectorProps> = ({
  baseId,
  roomId,
  onThemeSelected,
}) => {
  const navigationTheme = useTheme();
  const [themes, setThemes] = useState<RoomTheme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme | null>(null);

  useEffect(() => {
    loadThemes();
  }, [selectedCategory]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const loadedThemes = await RoomThemeService.getThemes(selectedCategory);
      setThemes(loadedThemes);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = async (theme: RoomTheme) => {
    try {
      if (!theme.isUnlocked) {
        // TODO: Show unlock confirmation dialog
        return;
      }

      await RoomThemeService.applyThemeToRoom(baseId, roomId, theme.id);
      setSelectedTheme(theme);
      onThemeSelected?.(theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  const renderCategoryButton = (category: 'common' | 'rare' | 'epic' | 'legendary', label: string) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategory,
        { borderColor: navigationTheme.colors.border }
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === category && styles.selectedCategoryText,
        { color: navigationTheme.colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={navigationTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        {renderCategoryButton('common', 'Common')}
        {renderCategoryButton('rare', 'Rare')}
        {renderCategoryButton('epic', 'Epic')}
        {renderCategoryButton('legendary', 'Legendary')}
      </View>

      <ScrollView style={styles.themesContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              selectedTheme?.id === theme.id && styles.selectedTheme,
              { borderColor: navigationTheme.colors.border }
            ]}
            onPress={() => handleThemeSelect(theme)}
          >
            <Image
              source={{ uri: theme.previewImage }}
              style={styles.themePreview}
              resizeMode="cover"
            />
            <View style={styles.themeInfo}>
              <Text style={[styles.themeName, { color: navigationTheme.colors.text }]}>
                {theme.name}
              </Text>
              <Text style={[styles.themeDescription, { color: navigationTheme.colors.text + '80' }]}>
                {theme.description}
              </Text>
              {!theme.isUnlocked && (
                <View style={styles.unlockInfo}>
                  <Text style={[styles.unlockCost, { color: navigationTheme.colors.primary }]}>
                    {theme.unlockCost} coins
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  categoriesContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  themesContainer: {
    flex: 1,
    padding: 10,
  },
  themeCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectedTheme: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  themePreview: {
    width: 100,
    height: 100,
  },
  themeInfo: {
    flex: 1,
    padding: 10,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  themeDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockCost: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 