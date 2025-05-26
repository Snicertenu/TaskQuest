import AsyncStorage from '@react-native-async-storage/async-storage';
import { Party, Task, PartyMember, Adventure, Item } from '../types';

const STORAGE_KEYS = {
  PARTY: '@TaskQuest/party',
  TASKS: '@TaskQuest/tasks',
  MEMBER: '@TaskQuest/member',
  ADVENTURE: '@TaskQuest/adventure',
  INVENTORY: '@TaskQuest/inventory',
  LAST_SYNC: '@TaskQuest/lastSync',
};

export class StorageService {
  public static async saveParty(party: Party): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PARTY, JSON.stringify(party));
    } catch (error) {
      console.error('Error saving party:', error);
      throw error;
    }
  }

  public static async getParty(): Promise<Party | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PARTY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting party:', error);
      return null;
    }
  }

  public static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  public static async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  public static async saveMember(member: PartyMember): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEMBER, JSON.stringify(member));
    } catch (error) {
      console.error('Error saving member:', error);
      throw error;
    }
  }

  public static async getMember(): Promise<PartyMember | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEMBER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting member:', error);
      return null;
    }
  }

  public static async saveAdventure(adventure: Adventure): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE, JSON.stringify(adventure));
    } catch (error) {
      console.error('Error saving adventure:', error);
      throw error;
    }
  }

  public static async getAdventure(): Promise<Adventure | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting adventure:', error);
      return null;
    }
  }

  public static async saveInventory(items: Item[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inventory:', error);
      throw error;
    }
  }

  public static async getInventory(): Promise<Item[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting inventory:', error);
      return [];
    }
  }

  public static async setLastSync(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error saving last sync:', error);
      throw error;
    }
  }

  public static async getLastSync(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? parseInt(data, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return 0;
    }
  }

  public static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
} 