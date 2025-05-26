import { firestore } from '../config/firebase';
import {
  SocialAction,
  PartyActivity,
  TaskCategory,
} from '../types';
import { AchievementService } from './achievementService';

export class SocialService {
  private static readonly SOCIAL_ACTIONS_COLLECTION = 'social_actions';
  private static readonly PARTY_ACTIVITIES_COLLECTION = 'party_activities';

  public static async createSocialAction(
    type: SocialAction['type'],
    fromUserId: string,
    toUserId: string,
    content?: string,
    itemId?: string,
    taskId?: string
  ): Promise<SocialAction> {
    const action: SocialAction = {
      id: firestore().collection(this.SOCIAL_ACTIONS_COLLECTION).doc().id,
      type,
      fromUserId,
      toUserId,
      timestamp: new Date(),
      content,
      itemId,
      taskId,
    };

    await firestore()
      .collection(this.SOCIAL_ACTIONS_COLLECTION)
      .doc(action.id)
      .set(action);

    // Create party activity
    await this.createPartyActivity({
      type: 'social',
      userId: fromUserId,
      content: this.generateActivityContent(action),
      data: {
        socialActionId: action.id,
      },
    });

    // Update achievements
    await AchievementService.updateProgress('social_butterfly', {
      type: 'social',
      count: 1,
    });

    return action;
  }

  public static async createPartyActivity(activity: Omit<PartyActivity, 'id' | 'timestamp'>): Promise<PartyActivity> {
    const newActivity: PartyActivity = {
      id: firestore().collection(this.PARTY_ACTIVITIES_COLLECTION).doc().id,
      ...activity,
      timestamp: new Date(),
    };

    await firestore()
      .collection(this.PARTY_ACTIVITIES_COLLECTION)
      .doc(newActivity.id)
      .set(newActivity);

    return newActivity;
  }

  public static async getPartyActivities(
    partyId: string,
    limit: number = 50
  ): Promise<PartyActivity[]> {
    const snapshot = await firestore()
      .collection(this.PARTY_ACTIVITIES_COLLECTION)
      .where('partyId', '==', partyId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as PartyActivity);
  }

  public static async getSocialActions(
    userId: string,
    type?: SocialAction['type']
  ): Promise<SocialAction[]> {
    let query = firestore()
      .collection(this.SOCIAL_ACTIONS_COLLECTION)
      .where('toUserId', '==', userId);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as SocialAction);
  }

  private static generateActivityContent(action: SocialAction): string {
    switch (action.type) {
      case 'visit':
        return 'visited your room';
      case 'chat':
        return `sent a message: "${action.content}"`;
      case 'gift':
        return 'sent you a gift';
      case 'help':
        return 'helped you with a task';
      case 'praise':
        return `praised you: "${action.content}"`;
      default:
        return 'interacted with you';
    }
  }

  public static async getRecentVisitors(userId: string): Promise<SocialAction[]> {
    const snapshot = await firestore()
      .collection(this.SOCIAL_ACTIONS_COLLECTION)
      .where('toUserId', '==', userId)
      .where('type', '==', 'visit')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    return snapshot.docs.map(doc => doc.data() as SocialAction);
  }

  public static async getUnreadSocialActions(userId: string): Promise<SocialAction[]> {
    const snapshot = await firestore()
      .collection(this.SOCIAL_ACTIONS_COLLECTION)
      .where('toUserId', '==', userId)
      .where('read', '==', false)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as SocialAction);
  }

  public static async markSocialActionAsRead(actionId: string): Promise<void> {
    await firestore()
      .collection(this.SOCIAL_ACTIONS_COLLECTION)
      .doc(actionId)
      .update({
        read: true,
      });
  }
} 