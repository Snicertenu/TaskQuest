import { Item, ItemRarity, ItemType, ItemCategory, Task, PartyMember, Achievement, TaskDifficulty } from '../types';
import { firestore } from '../config/firebase';

export class RewardsSystem {
  private static readonly XP_PER_LEVEL = 1000;
  private static readonly GOLD_MULTIPLIER = 10;
  private static readonly ITEM_CHANCE_MULTIPLIER = 0.1;

  // Rarity weights for item generation
  private static readonly RARITY_WEIGHTS = {
    common: 0.5,
    uncommon: 0.25,
    rare: 0.15,
    epic: 0.07,
    legendary: 0.025,
    mythic: 0.005,
  };

  // Item templates for different categories
  private static readonly ITEM_TEMPLATES = {
    fantasy: {
      weapons: [
        { name: 'Enchanted Sword', type: 'weapon', stats: { power: 10, defense: 0, utility: 0, dexterity: 0 } },
        { name: 'Mystic Staff', type: 'weapon', stats: { power: 15, defense: 0, utility: 5, dexterity: 0 } },
        { name: 'Elven Bow', type: 'weapon', stats: { power: 12, defense: 0, utility: 0, dexterity: 3 } },
      ],
      armor: [
        { name: 'Dwarven Plate', type: 'armor', stats: { power: 0, defense: 15, utility: 0, dexterity: 0 } },
        { name: 'Mage Robes', type: 'armor', stats: { power: 0, defense: 8, utility: 10, dexterity: 0 } },
        { name: 'Ranger\'s Cloak', type: 'armor', stats: { power: 0, defense: 10, utility: 0, dexterity: 5 } },
      ],
      artifacts: [
        { name: 'Crystal of Power', type: 'artifact', stats: { power: 0, defense: 0, utility: 20, dexterity: 0 } },
        { name: 'Ancient Amulet', type: 'artifact', stats: { power: 5, defense: 5, utility: 0, dexterity: 0 } },
      ],
    },
    steampunk: {
      weapons: [
        { name: 'Tesla Coil Gun', type: 'weapon', stats: { power: 18, defense: 0, utility: 2, dexterity: 0 } },
        { name: 'Steam-Powered Hammer', type: 'weapon', stats: { power: 20, defense: 0, utility: 0, dexterity: 0 } },
        { name: 'Clockwork Crossbow', type: 'weapon', stats: { power: 15, defense: 0, utility: 0, dexterity: 5 } },
      ],
      armor: [
        { name: 'Brass Plate Armor', type: 'armor', stats: { power: 0, defense: 18, utility: 0, dexterity: 0 } },
        { name: 'Steam-Powered Exoskeleton', type: 'armor', stats: { power: 5, defense: 15, utility: 0, dexterity: 0 } },
        { name: 'Goggles of Precision', type: 'armor', stats: { power: 0, defense: 5, utility: 15, dexterity: 0 } },
      ],
      artifacts: [
        { name: 'Steam Core', type: 'artifact', stats: { power: 0, defense: 0, utility: 25, dexterity: 0 } },
        { name: 'Mechanical Heart', type: 'artifact', stats: { power: 8, defense: 8, utility: 0, dexterity: 0 } },
      ],
    },
    scifi: {
      weapons: [
        { name: 'Plasma Rifle', type: 'weapon', stats: { power: 25, defense: 0, utility: 0, dexterity: 0 } },
        { name: 'Quantum Blade', type: 'weapon', stats: { power: 20, defense: 0, utility: 5, dexterity: 0 } },
        { name: 'Gravity Gun', type: 'weapon', stats: { power: 15, defense: 0, utility: 10, dexterity: 0 } },
      ],
      armor: [
        { name: 'Energy Shield', type: 'armor', stats: { power: 0, defense: 20, utility: 0, dexterity: 0 } },
        { name: 'Nano-Suit', type: 'armor', stats: { power: 0, defense: 15, utility: 10, dexterity: 0 } },
        { name: 'Holographic Cloak', type: 'armor', stats: { power: 0, defense: 10, utility: 0, dexterity: 15 } },
      ],
      artifacts: [
        { name: 'Quantum Core', type: 'artifact', stats: { power: 0, defense: 0, utility: 30, dexterity: 0 } },
        { name: 'Temporal Device', type: 'artifact', stats: { power: 10, defense: 10, utility: 0, dexterity: 0 } },
      ],
    },
  };

  // Achievement templates
  private static readonly ACHIEVEMENT_TEMPLATES = {
    task: [
      {
        title: 'Task Master',
        description: 'Complete 100 tasks',
        reward: { xp: 1000, gold: 500 },
      },
      {
        title: 'Speed Demon',
        description: 'Complete 10 tasks in one day',
        reward: { xp: 500, gold: 250 },
      },
    ],
    adventure: [
      {
        title: 'Adventure Seeker',
        description: 'Complete 5 adventures',
        reward: { xp: 2000, gold: 1000 },
      },
      {
        title: 'Boss Slayer',
        description: 'Defeat a monthly boss',
        reward: { xp: 1500, gold: 750 },
      },
    ],
    social: [
      {
        title: 'Party Animal',
        description: 'Invite 5 members to your party',
        reward: { xp: 800, gold: 400 },
      },
      {
        title: 'Team Player',
        description: 'Complete 50 tasks with party members',
        reward: { xp: 1200, gold: 600 },
      },
    ],
    collection: [
      {
        title: 'Collector',
        description: 'Collect 20 unique items',
        reward: { xp: 1000, gold: 500 },
      },
      {
        title: 'Treasure Hunter',
        description: 'Find 5 legendary items',
        reward: { xp: 2000, gold: 1000 },
      },
    ],
  };

  public static calculateTaskRewards(task: Task, member: PartyMember): {
    xp: number;
    gold: number;
    items?: Item[];
  } {
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      very_hard: 3,
    }[task.difficulty];

    const frequencyMultiplier = {
      daily: 1,
      weekly: 2,
      monthly: 3,
    }[task.frequency];

    const baseXp = 100;
    const baseGold = 50;

    const xp = Math.floor(baseXp * difficultyMultiplier * frequencyMultiplier);
    const gold = Math.floor(baseGold * difficultyMultiplier * frequencyMultiplier);

    // Calculate item chance
    const itemChance = task.rewards.itemChance * this.ITEM_CHANCE_MULTIPLIER;
    const items = Math.random() < itemChance ? this.generateRandomItems(1, task.difficulty) : undefined;

    return { xp, gold, items };
  }

  public static generateRandomItems(count: number, difficulty: TaskDifficulty): Item[] {
    const items: Item[] = [];
    const categories: ItemCategory[] = ['fantasy', 'steampunk', 'scifi'];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const rarity = this.selectRandomRarity();
      const template = this.selectRandomTemplate(category);
      
      const item: Item = {
        id: `item_${Date.now()}_${i}`,
        name: `${this.getRarityPrefix(rarity)} ${template.name}`,
        description: this.generateItemDescription(template, rarity, category),
        rarity,
        type: template.type as ItemType,
        category,
        stats: template.stats,
        value: this.calculateItemValue(rarity, template.stats),
      };

      items.push(item);
    }

    return items;
  }

  private static selectRandomRarity(): ItemRarity {
    const rand = Math.random();
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(this.RARITY_WEIGHTS)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return rarity as ItemRarity;
      }
    }

    return 'common';
  }

  private static selectRandomTemplate(category: ItemCategory): { name: string; type: string; stats: Record<string, number> } {
    const templates = this.ITEM_TEMPLATES[category];
    const types = Object.keys(templates) as Array<keyof typeof templates>;
    const type = types[Math.floor(Math.random() * types.length)];
    const items = templates[type];
    return items[Math.floor(Math.random() * items.length)];
  }

  private static getRarityPrefix(rarity: ItemRarity): string {
    const prefixes = {
      common: '',
      uncommon: 'Enhanced',
      rare: 'Mystic',
      epic: 'Ancient',
      legendary: 'Mythical',
      mythic: 'Cosmic',
    };
    return prefixes[rarity];
  }

  private static generateItemDescription(template: any, rarity: ItemRarity, category: ItemCategory): string {
    const rarityDescriptions = {
      common: 'A standard',
      uncommon: 'An improved',
      rare: 'A powerful',
      epic: 'An ancient',
      legendary: 'A mythical',
      mythic: 'A cosmic',
    };

    const categoryDescriptions = {
      fantasy: 'with magical properties',
      steampunk: 'powered by steam and gears',
      scifi: 'using advanced technology',
    };

    return `${rarityDescriptions[rarity]} ${template.type} ${categoryDescriptions[category]}.`;
  }

  private static calculateItemValue(rarity: ItemRarity, stats: Record<string, number>): number {
    const rarityMultiplier = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 8,
      legendary: 16,
      mythic: 32,
    }[rarity];

    const statValue = Object.values(stats).reduce((sum: number, stat: number) => sum + stat, 0);
    return Math.floor(statValue * rarityMultiplier * this.GOLD_MULTIPLIER);
  }

  public static async checkAndAwardAchievements(member: PartyMember): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    // Check task achievements
    const taskCount = await this.getTaskCount(member.id);
    if (taskCount >= 100) {
      newAchievements.push(this.createAchievement('task', 'Task Master'));
    }

    // Check adventure achievements
    const adventureCount = await this.getAdventureCount(member.id);
    if (adventureCount >= 5) {
      newAchievements.push(this.createAchievement('adventure', 'Adventure Seeker'));
    }

    // Check social achievements
    const partyMemberCount = await this.getPartyMemberCount(member.id);
    if (partyMemberCount >= 5) {
      newAchievements.push(this.createAchievement('social', 'Party Animal'));
    }

    // Check collection achievements
    const uniqueItemCount = this.getUniqueItemCount(member.inventory);
    if (uniqueItemCount >= 20) {
      newAchievements.push(this.createAchievement('collection', 'Collector'));
    }

    return newAchievements;
  }

  private static createAchievement(category: keyof typeof this.ACHIEVEMENT_TEMPLATES, title: string): Achievement {
    const template = this.ACHIEVEMENT_TEMPLATES[category].find((a) => a.title === title);
    if (!template) {
      throw new Error(`Achievement template not found for ${category} - ${title}`);
    }
    return {
      id: `achievement_${Date.now()}`,
      title: template.title,
      description: template.description,
      category,
      reward: template.reward,
      unlockedAt: new Date(),
    };
  }

  private static async getTaskCount(memberId: string): Promise<number> {
    const snapshot = await firestore()
      .collection('tasks')
      .where('assignedTo', '==', memberId)
      .where('completedAt', '!=', null)
      .count()
      .get();
    return snapshot.data().count;
  }

  private static async getAdventureCount(memberId: string): Promise<number> {
    const snapshot = await firestore()
      .collection('adventures')
      .where('completedBy', 'array-contains', memberId)
      .count()
      .get();
    return snapshot.data().count;
  }

  private static async getPartyMemberCount(memberId: string): Promise<number> {
    const partyDoc = await firestore()
      .collection('parties')
      .where('members', 'array-contains', memberId)
      .get();
    return partyDoc.docs[0]?.data()?.members?.length || 0;
  }

  private static getUniqueItemCount(inventory: Item[]): number {
    return new Set(inventory.map(item => item.name)).size;
  }
} 