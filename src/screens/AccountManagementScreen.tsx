import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useLocalStorage } from '../contexts/LocalStorageContext';
import { DataMigration } from '../utils/dataMigration';
import { auth } from '../config/firebase';

export const AccountManagementScreen: React.FC = () => {
  const theme = useTheme();
  const {
    character,
    tasks,
    achievements,
    inventory,
    isLocalMode,
    syncWithFirebase,
    clearLocalData,
  } = useLocalStorage();

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Validate data before migration
      const validation = await DataMigration.validateData({
        character: character!,
        tasks,
        achievements,
        inventory,
      });

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Create anonymous account
      const { user } = await auth().signInAnonymously();

      // Migrate data to Firebase
      await DataMigration.migrateToFirebase(user.uid, {
        character: character!,
        tasks,
        achievements,
        inventory,
      });

      // Sync local storage with Firebase
      await syncWithFirebase(user.uid);

      Alert.alert(
        'Success',
        'Your account has been created and your data has been migrated successfully!'
      );
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert(
        'Error',
        'Failed to create account. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'Are you sure you want to clear all local data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearLocalData();
              Alert.alert('Success', 'All local data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Account Status
        </Text>
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {isLocalMode ? 'Using Local Storage' : 'Connected to Account'}
        </Text>
      </View>

      {isLocalMode && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Local Data Summary
            </Text>
            <View style={styles.dataSummary}>
              <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                • Character: {character ? character.name : 'None'}
              </Text>
              <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                • Tasks: {tasks.length}
              </Text>
              <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                • Achievements: {achievements.length}
              </Text>
              <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                • Inventory Items: {inventory.length}
              </Text>
            </View>
          </View>

          {validationErrors.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.errorTitle, { color: theme.colors.notification }]}>
                Data Validation Errors
              </Text>
              {validationErrors.map((error, index) => (
                <Text key={index} style={[styles.errorText, { color: theme.colors.notification }]}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateAccount}
              disabled={!character || validationErrors.length > 0}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.notification }]}
              onPress={handleClearData}
            >
              <Text style={styles.buttonText}>Clear Local Data</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
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
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  dataSummary: {
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 