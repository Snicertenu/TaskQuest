import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  // TODO: Replace with actual data
  const currentAdventure = {
    title: 'Spring Cleaning',
    difficulty: 'medium',
    progress: 65,
    dailyEncounter: {
      title: 'Daily Chores',
      progress: 3,
      required: 5,
    },
    weeklyMiniBoss: {
      title: 'Weekly Deep Clean',
      progress: 2,
      required: 3,
    },
    monthlyBoss: {
      title: 'Monthly Organization',
      progress: 1,
      required: 1,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Adventure</Text>
        <Text style={styles.adventureTitle}>{currentAdventure.title}</Text>
        <Text style={styles.difficulty}>
          Difficulty: {currentAdventure.difficulty}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${currentAdventure.progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Overall Progress: {currentAdventure.progress}%
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Encounter</Text>
        <Text style={styles.encounterTitle}>
          {currentAdventure.dailyEncounter.title}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (currentAdventure.dailyEncounter.progress /
                    currentAdventure.dailyEncounter.required) *
                  100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Progress: {currentAdventure.dailyEncounter.progress}/
          {currentAdventure.dailyEncounter.required}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Mini-Boss</Text>
        <Text style={styles.encounterTitle}>
          {currentAdventure.weeklyMiniBoss.title}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (currentAdventure.weeklyMiniBoss.progress /
                    currentAdventure.weeklyMiniBoss.required) *
                  100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Progress: {currentAdventure.weeklyMiniBoss.progress}/
          {currentAdventure.weeklyMiniBoss.required}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Boss</Text>
        <Text style={styles.encounterTitle}>
          {currentAdventure.monthlyBoss.title}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  (currentAdventure.monthlyBoss.progress /
                    currentAdventure.monthlyBoss.required) *
                  100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Progress: {currentAdventure.monthlyBoss.progress}/
          {currentAdventure.monthlyBoss.required}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Tasks')}
      >
        <Text style={styles.buttonText}>View Tasks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f4511e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  adventureTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  encounterTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f4511e',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 