import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { firestore } from '../config/firebase';
import { Task, Adventure } from '../types';

export class NotificationService {
  private static readonly CHANNEL_ID = 'taskquest_channel';
  private static readonly CHANNEL_NAME = 'TaskQuest Notifications';
  private static readonly CHANNEL_DESCRIPTION = 'Notifications for TaskQuest app';

  public static async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await this.createNotificationChannel();
    }

    await this.requestPermission();
    await this.setupMessageHandlers();
  }

  private static async createNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      const channel = {
        id: this.CHANNEL_ID,
        name: this.CHANNEL_NAME,
        description: this.CHANNEL_DESCRIPTION,
        importance: 'high',
        vibration: true,
        sound: true,
      };

      await messaging().createNotificationChannel(channel);
    }
  }

  private static async requestPermission(): Promise<void> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      await this.updateFCMToken(token);
    }
  }

  private static async updateFCMToken(token: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (userId) {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({ fcmToken: token });
    }
  }

  private static async getCurrentUserId(): Promise<string | null> {
    // Implement your user authentication logic here
    return null;
  }

  private static async setupMessageHandlers(): Promise<void> {
    // Handle messages when the app is in the foreground
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.notification) {
        // Handle foreground message
        console.log('Received foreground message:', remoteMessage);
      }
    });

    // Handle messages when the app is in the background
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.notification) {
        // Handle background message
        console.log('Received background message:', remoteMessage);
      }
    });
  }

  public static async subscribeToTaskUpdates(taskId: string): Promise<void> {
    await firestore()
      .collection('tasks')
      .doc(taskId)
      .onSnapshot(async snapshot => {
        const task = snapshot.data() as Task;
        if (task) {
          await this.sendTaskNotification(task);
        }
      });
  }

  public static async subscribeToAdventureUpdates(adventureId: string): Promise<void> {
    await firestore()
      .collection('adventures')
      .doc(adventureId)
      .onSnapshot(async snapshot => {
        const adventure = snapshot.data() as Adventure;
        if (adventure) {
          await this.sendAdventureNotification(adventure);
        }
      });
  }

  private static async sendTaskNotification(task: Task): Promise<void> {
    const message = {
      notification: {
        title: 'Task Update',
        body: `Task "${task.title}" has been updated`,
      },
      data: {
        type: 'task',
        taskId: task.id,
      },
    };

    await firestore()
      .collection('notifications')
      .add({
        ...message,
        createdAt: new Date(),
        status: 'pending',
      });
  }

  private static async sendAdventureNotification(adventure: Adventure): Promise<void> {
    const message = {
      notification: {
        title: 'Adventure Update',
        body: `Adventure "${adventure.title}" has been updated`,
      },
      data: {
        type: 'adventure',
        adventureId: adventure.id,
      },
    };

    await firestore()
      .collection('notifications')
      .add({
        ...message,
        createdAt: new Date(),
        status: 'pending',
      });
  }

  public static async unsubscribeFromTaskUpdates(taskId: string): Promise<void> {
    // Implement unsubscribe logic
  }

  public static async unsubscribeFromAdventureUpdates(adventureId: string): Promise<void> {
    // Implement unsubscribe logic
  }
} 