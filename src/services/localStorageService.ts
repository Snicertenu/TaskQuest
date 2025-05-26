import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, Task, Achievement, Item } from '../types';
import { DataMigration } from '../utils/dataMigration';
import { firestore } from '../config/firebase';

interface PendingSync {
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

interface SyncConflict {
  localData: any;
  remoteData: any;
  collection: string;
  documentId: string;
}

export class LocalStorageService {
  private static readonly KEYS = {
    CHARACTER: '@local_character',
    TASKS: '@local_tasks',
    ACHIEVEMENTS: '@local_achievements',
    INVENTORY: '@local_inventory',
    SETTINGS: '@local_settings',
    PENDING_SYNC: '@pending_sync',
    SYNC_CONFLICTS: '@sync_conflicts',
  };

  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY_MS = 5000; // 5 seconds

  // Character
  public static async saveLocalCharacter(character: Character): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CHARACTER, JSON.stringify(character));
      if (character.userId) {
        await this.addPendingSync({
          type: 'update',
          collection: 'characters',
          data: character,
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    } catch (error) {
      console.error('Error saving local character:', error);
    }
  }

  public static async getLocalCharacter(): Promise<Character | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CHARACTER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting local character:', error);
      return null;
    }
  }

  // Tasks
  public static async saveLocalTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
      const character = await this.getLocalCharacter();
      if (character?.userId) {
        await this.addPendingSync({
          type: 'update',
          collection: 'tasks',
          data: tasks,
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    } catch (error) {
      console.error('Error saving local tasks:', error);
    }
  }

  public static async getLocalTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local tasks:', error);
      return [];
    }
  }

  // Achievements
  public static async saveLocalAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      const character = await this.getLocalCharacter();
      if (character?.userId) {
        await this.addPendingSync({
          type: 'update',
          collection: 'achievements',
          data: achievements,
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    } catch (error) {
      console.error('Error saving local achievements:', error);
    }
  }

  public static async getLocalAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local achievements:', error);
      return [];
    }
  }

  // Inventory
  public static async saveLocalInventory(items: Item[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.INVENTORY, JSON.stringify(items));
      const character = await this.getLocalCharacter();
      if (character?.userId) {
        await this.addPendingSync({
          type: 'update',
          collection: 'inventories',
          data: { items },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    } catch (error) {
      console.error('Error saving local inventory:', error);
    }
  }

  public static async getLocalInventory(): Promise<Item[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local inventory:', error);
      return [];
    }
  }

  // Settings
  public static async saveLocalSettings(settings: {
    soundEnabled: boolean;
    volume: number;
    notificationsEnabled: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving local settings:', error);
    }
  }

  public static async getLocalSettings(): Promise<{
    soundEnabled: boolean;
    volume: number;
    notificationsEnabled: boolean;
  }> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        soundEnabled: true,
        volume: 1.0,
        notificationsEnabled: true,
      };
    } catch (error) {
      console.error('Error getting local settings:', error);
      return {
        soundEnabled: true,
        volume: 1.0,
        notificationsEnabled: true,
      };
    }
  }

  // Pending Sync
  private static async addPendingSync(sync: PendingSync): Promise<void> {
    try {
      const pendingSyncs = await this.getPendingSyncs();
      pendingSyncs.push({
        ...sync,
        retryCount: 0,
      });
      await AsyncStorage.setItem(this.KEYS.PENDING_SYNC, JSON.stringify(pendingSyncs));
    } catch (error) {
      console.error('Error adding pending sync:', error);
    }
  }

  private static async updatePendingSync(sync: PendingSync): Promise<void> {
    try {
      const pendingSyncs = await this.getPendingSyncs();
      const index = pendingSyncs.findIndex(
        s => s.collection === sync.collection && s.timestamp === sync.timestamp
      );
      if (index !== -1) {
        pendingSyncs[index] = sync;
        await AsyncStorage.setItem(this.KEYS.PENDING_SYNC, JSON.stringify(pendingSyncs));
      }
    } catch (error) {
      console.error('Error updating pending sync:', error);
    }
  }

  public static async getPendingSyncs(): Promise<PendingSync[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending syncs:', error);
      return [];
    }
  }

  public static async clearPendingSyncs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.KEYS.PENDING_SYNC);
    } catch (error) {
      console.error('Error clearing pending syncs:', error);
    }
  }

  // Conflict Resolution
  private static async addSyncConflict(conflict: SyncConflict): Promise<void> {
    try {
      const conflicts = await this.getSyncConflicts();
      conflicts.push(conflict);
      await AsyncStorage.setItem(this.KEYS.SYNC_CONFLICTS, JSON.stringify(conflicts));
    } catch (error) {
      console.error('Error adding sync conflict:', error);
    }
  }

  public static async getSyncConflicts(): Promise<SyncConflict[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SYNC_CONFLICTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync conflicts:', error);
      return [];
    }
  }

  public static async resolveSyncConflict(
    conflict: SyncConflict,
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<void> {
    try {
      const conflicts = await this.getSyncConflicts();
      const index = conflicts.findIndex(
        c => c.collection === conflict.collection && c.documentId === conflict.documentId
      );

      if (index !== -1) {
        let resolvedData;
        switch (resolution) {
          case 'local':
            resolvedData = conflict.localData;
            break;
          case 'remote':
            resolvedData = conflict.remoteData;
            break;
          case 'merge':
            resolvedData = this.mergeData(conflict.localData, conflict.remoteData);
            break;
        }

        // Update the data in Firebase
        await firestore()
          .collection(conflict.collection)
          .doc(conflict.documentId)
          .set(resolvedData);

        // Remove the conflict
        conflicts.splice(index, 1);
        await AsyncStorage.setItem(this.KEYS.SYNC_CONFLICTS, JSON.stringify(conflicts));
      }
    } catch (error) {
      console.error('Error resolving sync conflict:', error);
    }
  }

  private static mergeData(localData: any, remoteData: any): any {
    // Implement merge strategy based on data type
    if (Array.isArray(localData) && Array.isArray(remoteData)) {
      return [...new Set([...localData, ...remoteData])];
    }

    if (typeof localData === 'object' && typeof remoteData === 'object') {
      return {
        ...remoteData,
        ...localData,
        updatedAt: Math.max(
          localData.updatedAt || 0,
          remoteData.updatedAt || 0
        ),
      };
    }

    return localData;
  }

  // Sync with Firebase
  public static async syncWithFirebase(userId: string): Promise<void> {
    try {
      const character = await this.getLocalCharacter();
      if (!character) {
        throw new Error('No character found');
      }

      const tasks = await this.getLocalTasks();
      const achievements = await this.getLocalAchievements();
      const inventory = await this.getLocalInventory();
      const settings = await this.getLocalSettings();
      const pendingSyncs = await this.getPendingSyncs();

      // Migrate data to Firebase
      await DataMigration.migrateToFirebase(userId, {
        character,
        tasks,
        achievements,
        inventory,
      });

      // Process pending syncs with retry mechanism
      for (const sync of pendingSyncs) {
        try {
          if (sync.retryCount >= this.MAX_RETRY_ATTEMPTS) {
            console.warn(`Max retry attempts reached for sync: ${sync.collection}`);
            continue;
          }

          // Check for conflicts
          const remoteDoc = await firestore()
            .collection(sync.collection)
            .doc(sync.data.id)
            .get();

          if (remoteDoc.exists) {
            const remoteData = remoteDoc.data();
            if (this.hasConflict(sync.data, remoteData)) {
              await this.addSyncConflict({
                localData: sync.data,
                remoteData,
                collection: sync.collection,
                documentId: sync.data.id,
              });
              continue;
            }
          }

          // Apply the sync
          switch (sync.type) {
            case 'create':
            case 'update':
              await firestore()
                .collection(sync.collection)
                .doc(sync.data.id)
                .set(sync.data);
              break;
            case 'delete':
              await firestore()
                .collection(sync.collection)
                .doc(sync.data.id)
                .delete();
              break;
          }

          // Remove successful sync
          await this.updatePendingSync({
            ...sync,
            retryCount: 0,
          });
        } catch (error: any) {
          console.error('Error processing pending sync:', error);
          // Increment retry count and update
          await this.updatePendingSync({
            ...sync,
            retryCount: sync.retryCount + 1,
            lastError: error.message,
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
        }
      }

      // Clear local data after successful sync
      await this.clearLocalData();
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
      throw error;
    }
  }

  private static hasConflict(localData: any, remoteData: any): boolean {
    if (!localData || !remoteData) return false;

    // Check if remote data is newer
    const localTimestamp = localData.updatedAt || 0;
    const remoteTimestamp = remoteData.updatedAt || 0;

    if (remoteTimestamp > localTimestamp) {
      return true;
    }

    // Check for specific field conflicts
    if (Array.isArray(localData) && Array.isArray(remoteData)) {
      return localData.length !== remoteData.length;
    }

    if (typeof localData === 'object' && typeof remoteData === 'object') {
      const localKeys = Object.keys(localData);
      const remoteKeys = Object.keys(remoteData);

      if (localKeys.length !== remoteKeys.length) {
        return true;
      }

      return localKeys.some(key => {
        if (key === 'updatedAt') return false;
        return JSON.stringify(localData[key]) !== JSON.stringify(remoteData[key]);
      });
    }

    return false;
  }

  // Clear all local data
  public static async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.CHARACTER,
        this.KEYS.TASKS,
        this.KEYS.ACHIEVEMENTS,
        this.KEYS.INVENTORY,
        this.KEYS.SETTINGS,
        this.KEYS.PENDING_SYNC,
        this.KEYS.SYNC_CONFLICTS,
      ]);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }
} 