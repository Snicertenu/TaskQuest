import { firestore } from '../config/firebase';
import {
  EnhancedAchievement,
  AchievementCategory,
  TaskCategory,
  SocialAction,
} from '../types';

export class AchievementService {
  private static readonly ACHIEVEMENTS_COLLECTION = 'achievements';
  private static readonly CATEGORIES_COLLECTION = 'achievement_categories';

  private static readonly DEFAULT_CATEGORIES: AchievementCategory[] = [
    {
      id: 'task_master',
      name: 'Task Master',
      description: 'Achievements related to task completion',
      icon: '✅',
      color: '#4CAF50',
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Achievements related to social interactions',
      icon: '🦋',
      color: '#2196F3',
    },
    {
      id: 'combat_expert',
      name: 'Combat Expert',
      description: 'Achievements related to combat actions',
      icon: '⚔️',
      color: '#F44336',
    },
    {
      id: 'collector',
      name: 'Collector',
      description: 'Achievements related to item collection',
      icon: '🎁',
      color: '#FFC107',
    },
  ];

  public static async initializeCategories(): Promise<void> {
    const batch = firestore().batch();
    
    for (const category of this.DEFAULT_CATEGORIES) {
      const docRef = firestore()
        .collection(this.CATEGORIES_COLLECTION)
        .doc(category.id);
      batch.set(docRef, category);
    }

    await batch.commit();
  }

  public static async createAchievement(
    title: string,
    description: string,
    category: AchievementCategory,
    requirements: EnhancedAchievement['requirements'],
    rewards: EnhancedAchievement['rewards']
  ): Promise<EnhancedAchievement> {
    const achievement: EnhancedAchievement = {
      id: firestore().collection(this.ACHIEVEMENTS_COLLECTION).doc().id,
      title,
      description,
      category,
      progress: 0,
      maxProgress: this.calculateMaxProgress(requirements),
      rewards,
      requirements,
      reward: {
        xp: rewards.xp,
        gold: rewards.gold,
        items: rewards.items,
      },
    };

    await firestore()
      .collection(this.ACHIEVEMENTS_COLLECTION)
      .doc(achievement.id)
      .set(achievement);

    return achievement;
  }

  public static async updateProgress(
    achievementId: string,
    action: {
      type: 'task' | 'social' | 'combat';
      category?: TaskCategory;
      count: number;
    }
  ): Promise<EnhancedAchievement | null> {
    const achievement = await this.getAchievement(achievementId);
    if (!achievement) {
      return null;
    }

    let newProgress = achievement.progress;

    switch (action.type) {
      case 'task':
        if (achievement.requirements.tasks) {
          newProgress += action.count;
        }
        if (action.category && achievement.requirements.tasksByCategory) {
          newProgress += action.count;
        }
        break;
      case 'social':
        if (achievement.requirements.socialActions) {
          newProgress += action.count;
        }
        break;
      case 'combat':
        if (achievement.requirements.combatActions) {
          newProgress += action.count;
        }
        break;
    }

    if (newProgress >= achievement.maxProgress) {
      newProgress = achievement.maxProgress;
      // TODO: Award rewards
    }

    await firestore()
      .collection(this.ACHIEVEMENTS_COLLECTION)
      .doc(achievementId)
      .update({
        progress: newProgress,
        unlockedAt: newProgress >= achievement.maxProgress ? new Date() : null,
      });

    return this.getAchievement(achievementId);
  }

  private static calculateMaxProgress(requirements: EnhancedAchievement['requirements']): number {
    let max = 0;
    if (requirements.tasks) max += requirements.tasks;
    if (requirements.tasksByCategory) {
      max += Object.values(requirements.tasksByCategory).reduce((sum, count) => sum + count, 0);
    }
    if (requirements.socialActions) max += requirements.socialActions;
    if (requirements.combatActions) max += requirements.combatActions;
    return max;
  }

  public static async getAchievement(achievementId: string): Promise<EnhancedAchievement | null> {
    const doc = await firestore()
      .collection(this.ACHIEVEMENTS_COLLECTION)
      .doc(achievementId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as EnhancedAchievement;
  }

  public static async getAchievementsByCategory(
    categoryId: string
  ): Promise<EnhancedAchievement[]> {
    const snapshot = await firestore()
      .collection(this.ACHIEVEMENTS_COLLECTION)
      .where('category.id', '==', categoryId)
      .get();

    return snapshot.docs.map(doc => doc.data() as EnhancedAchievement);
  }
} 