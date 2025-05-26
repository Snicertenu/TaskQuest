import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CharacterClass, CharacterClassInfo } from '../types';
import { CharacterService } from '../services/characterService';

interface CharacterCreationProps {
  userId: string;
  onCharacterCreated: () => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  userId,
  onCharacterCreated,
}) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [appearance, setAppearance] = useState({
    bodyType: 'average',
    hairStyle: 'short',
    hairColor: '#000000',
    skinColor: '#FFD700',
    eyeColor: '#0000FF',
    outfit: 'default',
    accessories: [] as string[],
  });

  const classes = CharacterService.getAllClasses();

  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a character name');
      return;
    }

    if (!selectedClass) {
      Alert.alert('Error', 'Please select a character class');
      return;
    }

    try {
      await CharacterService.createCharacter(
        userId,
        name.trim(),
        selectedClass,
        appearance
      );
      onCharacterCreated();
    } catch (error) {
      console.error('Error creating character:', error);
      Alert.alert('Error', 'Failed to create character');
    }
  };

  const renderClassCard = (classInfo: CharacterClassInfo) => (
    <TouchableOpacity
      key={classInfo.name}
      style={[
        styles.classCard,
        selectedClass === classInfo.name && styles.selectedClass,
        { borderColor: theme.colors.border }
      ]}
      onPress={() => setSelectedClass(classInfo.name)}
    >
      <Image
        source={{ uri: `class_${classInfo.name.toLowerCase()}.png` }}
        style={styles.classImage}
        resizeMode="cover"
      />
      <View style={styles.classInfo}>
        <Text style={[styles.className, { color: theme.colors.text }]}>
          {classInfo.name}
        </Text>
        <Text style={[styles.classDescription, { color: theme.colors.text + '80' }]}>
          {classInfo.description}
        </Text>
        <View style={styles.statsContainer}>
          <Text style={[styles.statText, { color: theme.colors.text }]}>
            STR: {classInfo.baseStats.str} (Melee Damage)
          </Text>
          <Text style={[styles.statText, { color: theme.colors.text }]}>
            DEX: {classInfo.baseStats.dex} (Ranged/Stealth)
          </Text>
          <Text style={[styles.statText, { color: theme.colors.text }]}>
            INT: {classInfo.baseStats.int} (Magic/Heals)
          </Text>
          <Text style={[styles.statText, { color: theme.colors.text }]}>
            CON: {classInfo.baseStats.con} (Health)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Character Name
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.colors.border, color: theme.colors.text }
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter character name"
          placeholderTextColor={theme.colors.text + '80'}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Choose Class
        </Text>
        {classes.map(renderClassCard)}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Appearance
        </Text>
        {/* TODO: Add appearance customization UI */}
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateCharacter}
      >
        <Text style={styles.createButtonText}>Create Character</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  classCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  selectedClass: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  classImage: {
    width: 100,
    height: 100,
  },
  classInfo: {
    flex: 1,
    padding: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    marginRight: 12,
    marginBottom: 4,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 