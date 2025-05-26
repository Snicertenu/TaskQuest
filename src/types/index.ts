export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly';
export type AdventureDifficulty = 'easy' | 'medium' | 'hard';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type ItemType = 'weapon' | 'armor' | 'artifact' | 'consumable' | 'cosmetic';
export type ItemCategory = 'fantasy' | 'steampunk' | 'scifi';

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  type: ItemType;
  category: ItemCategory;
  stats?: {
    power?: number;
    defense?: number;
    utility?: number;
  };
  effects?: {
    type: 'buff' | 'debuff' | 'special';
    description: string;
    duration?: number;
  }[];
  imageUrl?: string;
  value: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  frequency: TaskFrequency;
  assignedTo?: string;
  isCustom: boolean;
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
  rewards: {
    xp: number;
    gold: number;
    itemChance: number;
    possibleItems?: Item[];
  };
}

export interface PartyMember {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  gold: number;
  inventory: Item[];
  equipment: {
    weapon?: Item;
    armor?: Item;
    artifact?: Item;
  };
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    constitution: number;
    wisdom: number;
    charisma: number;
  };
  class: 'warrior' | 'mage' | 'rogue' | 'engineer' | 'scout';
  isPartyLeader: boolean;
  achievements: Achievement[];
  roomPreferences: {
    isPrivate: boolean;
    activeCustomizations: {
      wallpaper?: string;
      flooring?: string;
      furniture?: string[];
      decorations?: string[];
    };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  reward: {
    xp: number;
    gold: number;
    items?: Item[];
  };
  unlockedAt?: Date;
}

export type PartyType = 'household' | 'raiding';

export interface RaidingParty extends Party {
  type: 'raiding';
  startDate: Date;
  endDate: Date;
  isRenewed: boolean;
  renewalCost: number;
  leaders: string[]; // Array of member IDs who are leaders
}

export type BaseType = 'tavern' | 'inn' | 'shop' | 'house';

export interface BaseCustomization {
  id: string;
  name: string;
  type: 'wallpaper' | 'flooring' | 'furniture' | 'decoration';
  category: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  unlockCost: number;
  isUnlocked: boolean;
}

export interface FurnitureItem {
  id: string;
  name: string;
  type: 'chair' | 'table' | 'bed' | 'storage' | 'decoration';
  width: number;  // in grid units
  height: number; // in grid units
  imageUrl: string;
  unlockCost: number;
  isUnlocked: boolean;
  category: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RoomLayout {
  id: string;
  name: string;
  width: number;  // in grid units
  height: number; // in grid units
  furniture: Array<{
    itemId: string;
    x: number;
    y: number;
    rotation: number; // 0, 90, 180, 270 degrees
  }>;
  wallpaper: string;
  flooring: string;
  theme: 'cozy' | 'modern' | 'fantasy' | 'steampunk' | 'sci-fi';
}

export interface RoomCustomization {
  id: string;
  name: string;
  type: 'wallpaper' | 'flooring' | 'furniture' | 'decoration';
  category: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  unlockCost: number;
  isUnlocked: boolean;
  layout?: RoomLayout; // Optional layout for furniture items
}

export interface PartyBase {
  id: string;
  partyId: string;
  type: BaseType;
  name: string;
  level: number;
  commonRoom: {
    customizations: BaseCustomization[];
    activeMembers: string[];
    layout: RoomLayout;
  };
  rooms: {
    [memberId: string]: {
      customizations: RoomCustomization[];
      isPrivate: boolean;
      layout: RoomLayout;
    };
  };
  unlockedCustomizations: {
    common: string[];
    rare: string[];
    epic: string[];
    legendary: string[];
  };
  unlockedFurniture: {
    common: string[];
    rare: string[];
    epic: string[];
    legendary: string[];
  };
}

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  code: string;
  members: PartyMember[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  settings: {
    maxMembers: number;
    allowInvites: boolean;
    requireApproval: boolean;
  };
  base: PartyBase;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  difficulty: AdventureDifficulty;
  startDate: Date;
  endDate: Date;
  dailyEncounter: Encounter;
  weeklyMiniBoss: Encounter;
  monthlyBoss: Encounter;
  rewards: {
    gold: number;
    xp: number;
    items: Item[];
  };
  theme: {
    setting: 'fantasy' | 'steampunk' | 'scifi';
    atmosphere: string;
    specialRules?: string[];
  };
}

export interface Encounter {
  id: string;
  title: string;
  description: string;
  difficulty: AdventureDifficulty;
  progress: number;
  requiredProgress: number;
  rewards: {
    gold: number;
    xp: number;
    itemChance: number;
    possibleItems?: Item[];
  };
  specialConditions?: {
    type: string;
    description: string;
    bonusRewards?: {
      xp: number;
      gold: number;
      itemChance: number;
    };
  }[];
}

export type CharacterClass = 
  | 'Warrior'
  | 'Ranger'
  | 'Rogue'
  | 'Mage'
  | 'Priest'
  | 'Monk'
  | 'Gunner'
  | 'MagicSwordsman';

export interface CharacterStats {
  str: number;  // Strength - increases physical damage of melee attacks
  dex: number;  // Dexterity - increases stealth attacks and ranged attacks
  int: number;  // Intelligence - increases magic attacks and heals
  con: number;  // Constitution - increases health
}

export interface CharacterClassInfo {
  name: CharacterClass;
  description: string;
  baseStats: CharacterStats;
  statGrowth: CharacterStats;
  skills: string[];
  weaponTypes: string[];
  armorTypes: string[];
  specializations: string[];
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  gold: number;
  stats: CharacterStats;
  appearance: {
    bodyType: string;
    hairStyle: string;
    hairColor: string;
    skinColor: string;
    eyeColor: string;
    outfit: string;
    accessories: string[];
  };
  skills: {
    id: string;
    name: string;
    level: number;
    experience: number;
  }[];
  equipment: {
    weapon: string | null;
    armor: string | null;
    accessories: string[];
  };
  inventory: {
    id: string;
    quantity: number;
  }[];
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CombatStats {
  maxHealth: number;
  meleeDamage: number;
  rangedDamage: number;
  magicDamage: number;
  healPower: number;
}

export interface EquipmentRequirement {
  str?: number;
  dex?: number;
  int?: number;
  con?: number;
}

export interface Equipment extends Item {
  requirements: EquipmentRequirement;
  slot: 'weapon' | 'armor' | 'accessory';
  combatStats: {
    health?: number;
    meleeDamage?: number;
    rangedDamage?: number;
    magicDamage?: number;
    healPower?: number;
  };
}

export interface LevelUpPoints {
  availablePoints: number;
  allocatedPoints: {
    str: number;
    dex: number;
    int: number;
    con: number;
  };
}

export type TaskCategory = 'chores' | 'work' | 'health' | 'learning' | 'social' | 'personal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type AttackType = 'basic' | 'special' | 'ultimate';

export interface TaskDependency {
  taskId: string;
  type: 'blocking' | 'suggested';
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  frequency: TaskFrequency;
  estimatedDuration: number; // in minutes
  dependencies: TaskDependency[];
  rewards: {
    xp: number;
    gold: number;
    itemChance: number;
    possibleItems?: Item[];
  };
}

export interface EnhancedTask extends Task {
  category: TaskCategory;
  status: TaskStatus;
  dependencies: TaskDependency[];
  template?: string; // Reference to TaskTemplate
  progress: number;
  assignedTo?: string;
  completedBy?: string;
  completionDate?: Date;
  partyId: string;
  combatContribution?: {
    damage: number;
    attackType: AttackType;
    target: 'encounter' | 'miniBoss' | 'boss';
  };
}

export interface CombatAction {
  type: AttackType;
  damage: number;
  target: 'encounter' | 'miniBoss' | 'boss';
  characterId: string;
  taskId: string;
  timestamp: Date;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface EnhancedAchievement extends Achievement {
  category: AchievementCategory;
  progress: number;
  maxProgress: number;
  rewards: {
    xp: number;
    gold: number;
    items?: Item[];
    title?: string;
    cosmetic?: string;
  };
  requirements: {
    tasks?: number;
    tasksByCategory?: Record<TaskCategory, number>;
    combatActions?: number;
    socialActions?: number;
  };
}

export interface SocialAction {
  id: string;
  type: 'visit' | 'chat' | 'gift' | 'help' | 'praise';
  fromUserId: string;
  toUserId: string;
  timestamp: Date;
  content?: string;
  itemId?: string;
  taskId?: string;
}

export interface PartyActivity {
  id: string;
  type: 'task_complete' | 'achievement' | 'level_up' | 'social' | 'combat';
  userId: string;
  timestamp: Date;
  content: string;
  data: {
    taskId?: string;
    achievementId?: string;
    characterId?: string;
    socialActionId?: string;
    combatActionId?: string;
  };
} 