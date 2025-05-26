import { firestore } from '../config/firebase';
import { Item, Task, EnhancedAchievement } from '../types';
import { CharacterService } from './characterService';

export class RewardService {
  private static readonly REWARDS_COLLECTION = 'rewards';
  private static readonly ITEMS_COLLECTION = 'items';

  public static async distributeTaskRewards(
    task: Task,
    userId: string
  ): Promise<{
    xp: number;
    gold: number;
    items: Item[];
  }> {
    const character = await CharacterService.getCharacterByUserId(userId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Calculate base rewards
    const rewards = {
      xp: task.rewards.xp,
      gold: task.rewards.gold,
      items: [] as Item[],
    };

    // Roll for item drops
    if (task.rewards.itemChance > 0 && task.rewards.possibleItems) {
      const roll = Math.random();
      if (roll <= task.rewards.itemChance) {
        const randomItem = task.rewards.possibleItems[
          Math.floor(Math.random() * task.rewards.possibleItems.length)
        ];
        rewards.items.push(randomItem);
      }
    }

    // Apply rewards to character
    await CharacterService.addExperience(character.id, rewards.xp);
    await CharacterService.addGold(character.id, rewards.gold);
    if (rewards.items.length > 0) {
      await CharacterService.addItemsToInventory(character.id, rewards.items);
    }

    // Log reward distribution
    await this.logRewardDistribution({
      userId,
      type: 'task',
      sourceId: task.id,
      rewards,
    });

    return rewards;
  }

  public static async distributeAchievementRewards(
    achievement: EnhancedAchievement,
    userId: string
  ): Promise<{
    xp: number;
    gold: number;
    items: Item[];
  }> {
    const character = await CharacterService.getCharacterByUserId(userId);
    if (!character) {
      throw new Error('Character not found');
    }

    const rewards = {
      xp: achievement.rewards.xp,
      gold: achievement.rewards.gold,
      items: achievement.rewards.items || [],
    };

    // Apply rewards to character
    await CharacterService.addExperience(character.id, rewards.xp);
    await CharacterService.addGold(character.id, rewards.gold);
    if (rewards.items.length > 0) {
      await CharacterService.addItemsToInventory(character.id, rewards.items);
    }

    // Log reward distribution
    await this.logRewardDistribution({
      userId,
      type: 'achievement',
      sourceId: achievement.id,
      rewards,
    });

    return rewards;
  }

  public static async distributeCombatRewards(
    damage: number,
    target: 'encounter' | 'miniBoss' | 'boss',
    userId: string
  ): Promise<{
    xp: number;
    gold: number;
    items: Item[];
  }> {
    const character = await CharacterService.getCharacterByUserId(userId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Calculate rewards based on damage and target
    const multiplier = this.getTargetMultiplier(target);
    const rewards = {
      xp: Math.floor(damage * 0.5 * multiplier),
      gold: Math.floor(damage * 0.2 * multiplier),
      items: [] as Item[],
    };

    // Roll for item drops based on target
    const itemChance = this.getTargetItemChance(target);
    if (Math.random() <= itemChance) {
      const items = await this.getRandomItems(target);
      rewards.items.push(...items);
    }

    // Apply rewards to character
    await CharacterService.addExperience(character.id, rewards.xp);
    await CharacterService.addGold(character.id, rewards.gold);
    if (rewards.items.length > 0) {
      await CharacterService.addItemsToInventory(character.id, rewards.items);
    }

    // Log reward distribution
    await this.logRewardDistribution({
      userId,
      type: 'combat',
      sourceId: target,
      rewards,
    });

    return rewards;
  }

  private static getTargetMultiplier(target: string): number {
    switch (target) {
      case 'encounter':
        return 1;
      case 'miniBoss':
        return 2;
      case 'boss':
        return 5;
      default:
        return 1;
    }
  }

  private static getTargetItemChance(target: string): number {
    switch (target) {
      case 'encounter':
        return 0.1;
      case 'miniBoss':
        return 0.3;
      case 'boss':
        return 0.5;
      default:
        return 0;
    }
  }

  private static async getRandomItems(target: string): Promise<Item[]> {
    const rarity = this.getTargetRarity(target);
    const snapshot = await firestore()
      .collection(this.ITEMS_COLLECTION)
      .where('rarity', '==', rarity)
      .limit(10)
      .get();

    const items = snapshot.docs.map(doc => doc.data() as Item);
    const randomItem = items[Math.floor(Math.random() * items.length)];
    return randomItem ? [randomItem] : [];
  }

  private static getTargetRarity(target: string): string {
    switch (target) {
      case 'encounter':
        return 'common';
      case 'miniBoss':
        return 'rare';
      case 'boss':
        return 'epic';
      default:
        return 'common';
    }
  }

  private static async logRewardDistribution(data: {
    userId: string;
    type: 'task' | 'achievement' | 'combat';
    sourceId: string;
    rewards: {
      xp: number;
      gold: number;
      items: Item[];
    };
  }): Promise<void> {
    await firestore()
      .collection(this.REWARDS_COLLECTION)
      .add({
        ...data,
        timestamp: new Date(),
      });
  }
} 