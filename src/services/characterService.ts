import { firestore } from '../config/firebase';
import { Character, CharacterClass, CharacterClassInfo, CharacterStats, CombatStats, Equipment, LevelUpPoints, Item } from '../types';

export class CharacterService {
  private static readonly CHARACTERS_COLLECTION = 'characters';
  private static readonly CLASS_INFO_COLLECTION = 'character_classes';

  private static readonly CLASS_INFO: Record<CharacterClass, CharacterClassInfo> = {
    Warrior: {
      name: 'Warrior',
      description: 'A master of close combat and heavy weapons.',
      baseStats: {
        str: 10,
        dex: 6,
        int: 4,
        con: 8,
      },
      statGrowth: {
        str: 1.2,
        dex: 0.8,
        int: 0.4,
        con: 1.0,
      },
      skills: ['Slash', 'Defend', 'War Cry'],
      weaponTypes: ['Sword', 'Axe', 'Mace', 'Spear'],
      armorTypes: ['Heavy', 'Medium'],
      specializations: ['Berserker', 'Guardian', 'Warlord'],
    },
    Ranger: {
      name: 'Ranger',
      description: 'An expert in ranged combat and wilderness survival.',
      baseStats: {
        str: 6,
        dex: 10,
        int: 6,
        con: 6,
      },
      statGrowth: {
        str: 0.6,
        dex: 1.2,
        int: 0.7,
        con: 0.7,
      },
      skills: ['Precise Shot', 'Quick Draw', 'Track'],
      weaponTypes: ['Bow', 'Crossbow', 'Dagger'],
      armorTypes: ['Light', 'Medium'],
      specializations: ['Hunter', 'Scout', 'Beastmaster'],
    },
    Rogue: {
      name: 'Rogue',
      description: 'A stealthy fighter specializing in critical strikes.',
      baseStats: {
        str: 6,
        dex: 12,
        int: 7,
        con: 5,
      },
      statGrowth: {
        str: 0.5,
        dex: 1.3,
        int: 0.8,
        con: 0.6,
      },
      skills: ['Backstab', 'Stealth', 'Pickpocket'],
      weaponTypes: ['Dagger', 'Short Sword', 'Throwing Knife'],
      armorTypes: ['Light'],
      specializations: ['Assassin', 'Thief', 'Swashbuckler'],
    },
    Mage: {
      name: 'Mage',
      description: 'A wielder of arcane magic and elemental forces.',
      baseStats: {
        str: 3,
        dex: 6,
        int: 12,
        con: 5,
      },
      statGrowth: {
        str: 0.3,
        dex: 0.6,
        int: 1.4,
        con: 0.5,
      },
      skills: ['Fireball', 'Ice Spike', 'Arcane Shield'],
      weaponTypes: ['Staff', 'Wand', 'Orb'],
      armorTypes: ['Cloth'],
      specializations: ['Elementalist', 'Necromancer', 'Enchanter'],
    },
    Priest: {
      name: 'Priest',
      description: 'A divine spellcaster focused on healing and support.',
      baseStats: {
        str: 4,
        dex: 5,
        int: 10,
        con: 6,
      },
      statGrowth: {
        str: 0.4,
        dex: 0.5,
        int: 1.3,
        con: 0.7,
      },
      skills: ['Heal', 'Bless', 'Smite'],
      weaponTypes: ['Mace', 'Staff', 'Holy Symbol'],
      armorTypes: ['Cloth', 'Light'],
      specializations: ['Healer', 'Paladin', 'Inquisitor'],
    },
    Monk: {
      name: 'Monk',
      description: 'A martial artist mastering unarmed combat and inner energy.',
      baseStats: {
        str: 8,
        dex: 10,
        int: 6,
        con: 7,
      },
      statGrowth: {
        str: 0.9,
        dex: 1.1,
        int: 0.6,
        con: 0.8,
      },
      skills: ['Flying Kick', 'Meditate', 'Pressure Point'],
      weaponTypes: ['Fist', 'Staff', 'Nunchaku'],
      armorTypes: ['Light'],
      specializations: ['Martial Artist', 'Spiritualist', 'Drunken Master'],
    },
    Gunner: {
      name: 'Gunner',
      description: 'A modern warrior wielding firearms and explosives.',
      baseStats: {
        str: 7,
        dex: 9,
        int: 8,
        con: 6,
      },
      statGrowth: {
        str: 0.7,
        dex: 1.0,
        int: 0.9,
        con: 0.6,
      },
      skills: ['Rapid Fire', 'Grenade Toss', 'Snipe'],
      weaponTypes: ['Pistol', 'Rifle', 'Shotgun'],
      armorTypes: ['Light', 'Medium'],
      specializations: ['Sharpshooter', 'Demolitionist', 'Gunslinger'],
    },
    MagicSwordsman: {
      name: 'MagicSwordsman',
      description: 'A hybrid warrior combining swordplay with magic.',
      baseStats: {
        str: 8,
        dex: 8,
        int: 9,
        con: 7,
      },
      statGrowth: {
        str: 0.9,
        dex: 0.9,
        int: 1.0,
        con: 0.8,
      },
      skills: ['Magic Slash', 'Spell Blade', 'Arcane Strike'],
      weaponTypes: ['Sword', 'Rapier', 'Magic Blade'],
      armorTypes: ['Light', 'Medium'],
      specializations: ['Spellblade', 'Arcane Knight', 'Mystic Warrior'],
    },
  };

  public static async createCharacter(
    userId: string,
    name: string,
    characterClass: CharacterClass,
    appearance: Character['appearance']
  ): Promise<Character> {
    const classInfo = this.CLASS_INFO[characterClass];
    const character: Character = {
      id: firestore().collection(this.CHARACTERS_COLLECTION).doc().id,
      userId,
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      stats: { ...classInfo.baseStats },
      appearance,
      skills: classInfo.skills.map(skill => ({
        id: skill.toLowerCase().replace(/\s+/g, '_'),
        name: skill,
        level: 1,
        experience: 0,
      })),
      equipment: {
        weapon: null,
        armor: null,
        accessories: [],
      },
      inventory: [],
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(character.id)
      .set(character);

    return character;
  }

  public static async getCharacter(characterId: string): Promise<Character | null> {
    const doc = await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as Character;
  }

  public static async getCharacterByUserId(userId: string): Promise<Character | null> {
    const snapshot = await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as Character;
  }

  public static async addExperience(characterId: string, amount: number): Promise<void> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const newExperience = character.experience + amount;
    const experienceToNextLevel = this.getExperienceForLevel(character.level + 1);
    let newLevel = character.level;

    if (newExperience >= experienceToNextLevel) {
      newLevel++;
      await this.levelUp(characterId, newLevel);
    }

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .update({
        experience: newExperience,
        level: newLevel,
        updatedAt: new Date(),
      });
  }

  public static calculateCombatStats(character: Character): CombatStats {
    const baseHealth = 50 + (character.stats.con * 10);
    const baseMeleeDamage = 5 + (character.stats.str * 2);
    const baseRangedDamage = 5 + (character.stats.dex * 2);
    const baseMagicDamage = 5 + (character.stats.int * 2);
    const baseHealPower = 5 + (character.stats.int * 1.5);

    // Apply equipment bonuses
    const equipment = character.equipment;
    let healthBonus = 0;
    let meleeBonus = 0;
    let rangedBonus = 0;
    let magicBonus = 0;
    let healBonus = 0;

    // TODO: Add equipment stat calculations when equipment system is implemented

    return {
      maxHealth: baseHealth + healthBonus,
      meleeDamage: baseMeleeDamage + meleeBonus,
      rangedDamage: baseRangedDamage + rangedBonus,
      magicDamage: baseMagicDamage + magicBonus,
      healPower: baseHealPower + healBonus,
    };
  }

  public static canEquipItem(character: Character, equipment: Equipment): boolean {
    const requirements = equipment.requirements;
    return (
      (!requirements.str || character.stats.str >= requirements.str) &&
      (!requirements.dex || character.stats.dex >= requirements.dex) &&
      (!requirements.int || character.stats.int >= requirements.int) &&
      (!requirements.con || character.stats.con >= requirements.con)
    );
  }

  public static async allocateStatPoints(
    characterId: string,
    points: { str: number; dex: number; int: number; con: number }
  ): Promise<void> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const totalPoints = points.str + points.dex + points.int + points.con;
    if (totalPoints > 5) {
      throw new Error('Cannot allocate more than 5 points per level');
    }

    const newStats = {
      str: character.stats.str + points.str,
      dex: character.stats.dex + points.dex,
      int: character.stats.int + points.int,
      con: character.stats.con + points.con,
    };

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .update({
        stats: newStats,
        updatedAt: new Date(),
      });
  }

  private static async levelUp(characterId: string, newLevel: number): Promise<void> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const classInfo = this.CLASS_INFO[character.class];
    const newStats = this.calculateStatsAtLevel(classInfo, newLevel);

    // Add 5 stat points for the player to allocate
    const levelUpPoints: LevelUpPoints = {
      availablePoints: 5,
      allocatedPoints: {
        str: 0,
        dex: 0,
        int: 0,
        con: 0,
      },
    };

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .update({
        stats: newStats,
        levelUpPoints,
        updatedAt: new Date(),
      });
  }

  private static calculateStatsAtLevel(
    classInfo: CharacterClassInfo,
    level: number
  ): CharacterStats {
    const stats: CharacterStats = { ...classInfo.baseStats };
    const levelDiff = level - 1;

    Object.keys(stats).forEach((stat) => {
      const key = stat as keyof CharacterStats;
      stats[key] = Math.floor(
        classInfo.baseStats[key] + classInfo.statGrowth[key] * levelDiff
      );
    });

    return stats;
  }

  private static getExperienceForLevel(level: number): number {
    // Experience curve: 100 * (level ^ 1.5)
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  public static getClassInfo(characterClass: CharacterClass): CharacterClassInfo {
    return this.CLASS_INFO[characterClass];
  }

  public static getAllClasses(): CharacterClassInfo[] {
    return Object.values(this.CLASS_INFO);
  }

  public static async addGold(characterId: string, amount: number): Promise<void> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .update({
        gold: character.gold + amount,
        updatedAt: new Date(),
      });
  }

  public static async addItemsToInventory(characterId: string, items: Item[]): Promise<void> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const updatedInventory = [...character.inventory];
    for (const item of items) {
      const existingItem = updatedInventory.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedInventory.push({ id: item.id, quantity: 1 });
      }
    }

    await firestore()
      .collection(this.CHARACTERS_COLLECTION)
      .doc(characterId)
      .update({
        inventory: updatedInventory,
        updatedAt: new Date(),
      });
  }
} 