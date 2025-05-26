import { firestore } from '../config/firebase';
import { StorageService } from './storage';
import { Party, Task, PartyMember, Adventure } from '../types';
import NetInfo from '@react-native-community/netinfo';

export class SyncService {
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static syncTimer: NodeJS.Timeout | null = null;

  public static async startSync(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Initial sync
    await this.performSync();

    // Set up periodic sync
    this.syncTimer = setInterval(async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await this.performSync();
      }
    }, this.SYNC_INTERVAL);
  }

  public static stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private static async performSync(): Promise<void> {
    try {
      const lastSync = await StorageService.getLastSync();
      const now = Date.now();

      // Sync party data
      await this.syncPartyData();

      // Sync tasks
      await this.syncTasks(lastSync);

      // Sync member data
      await this.syncMemberData();

      // Sync adventure data
      await this.syncAdventureData();

      // Update last sync timestamp
      await StorageService.setLastSync(now);
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  private static async syncPartyData(): Promise<void> {
    const localParty = await StorageService.getParty();
    if (!localParty) return;

    const remoteParty = await firestore()
      .collection('parties')
      .doc(localParty.id)
      .get();

    if (remoteParty.exists) {
      const remoteData = remoteParty.data() as Party;
      if (remoteData.members.length !== localParty.members.length) {
        await StorageService.saveParty(remoteData);
      }
    }
  }

  private static async syncTasks(lastSync: number): Promise<void> {
    const localTasks = await StorageService.getTasks();
    const member = await StorageService.getMember();
    if (!member) return;

    const remoteTasks = await firestore()
      .collection('tasks')
      .where('assignedTo', '==', member.id)
      .where('updatedAt', '>', new Date(lastSync))
      .get();

    const updatedTasks = [...localTasks];
    remoteTasks.forEach(doc => {
      const remoteTask = doc.data() as Task;
      const localIndex = updatedTasks.findIndex(t => t.id === remoteTask.id);
      if (localIndex >= 0) {
        updatedTasks[localIndex] = remoteTask;
      } else {
        updatedTasks.push(remoteTask);
      }
    });

    await StorageService.saveTasks(updatedTasks);
  }

  private static async syncMemberData(): Promise<void> {
    const localMember = await StorageService.getMember();
    if (!localMember) return;

    const remoteMember = await firestore()
      .collection('members')
      .doc(localMember.id)
      .get();

    if (remoteMember.exists) {
      const remoteData = remoteMember.data() as PartyMember;
      if (remoteData.xp !== localMember.xp || remoteData.gold !== localMember.gold) {
        await StorageService.saveMember(remoteData);
      }
    }
  }

  private static async syncAdventureData(): Promise<void> {
    const localAdventure = await StorageService.getAdventure();
    const member = await StorageService.getMember();
    if (!member) return;

    const remoteAdventure = await firestore()
      .collection('adventures')
      .where('partyId', '==', member.id)
      .where('status', '==', 'active')
      .get();

    if (!remoteAdventure.empty) {
      const remoteData = remoteAdventure.docs[0].data() as Adventure;
      if (!localAdventure || localAdventure.id !== remoteData.id) {
        await StorageService.saveAdventure(remoteData);
      }
    }
  }

  public static async handleOfflineAction<T>(
    action: () => Promise<T>,
    offlineData: T
  ): Promise<T> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return offlineData;
    }
    return action();
  }
} 