import { Character, Task, Achievement, Item } from '../types';
import { firestore } from '../config/firebase';

export class DataMigration {
  public static async migrateToFirebase(
    userId: string,
    data: {
      character: Character;
      tasks: Task[];
      achievements: Achievement[];
      inventory: Item[];
    }
  ): Promise<void> {
    try {
      const batch = firestore().batch();

      // Migrate character
      const characterRef = firestore().collection('characters').doc(userId);
      batch.set(characterRef, {
        ...data.character,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Migrate tasks
      const tasksRef = firestore().collection('tasks');
      data.tasks.forEach(task => {
        const taskRef = tasksRef.doc();
        batch.set(taskRef, {
          ...task,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      // Migrate achievements
      const achievementsRef = firestore().collection('achievements');
      data.achievements.forEach(achievement => {
        const achievementRef = achievementsRef.doc();
        batch.set(achievementRef, {
          ...achievement,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      // Migrate inventory
      const inventoryRef = firestore().collection('inventories').doc(userId);
      batch.set(inventoryRef, {
        userId,
        items: data.inventory,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error('Error migrating data to Firebase:', error);
      throw error;
    }
  }

  public static async validateData(data: {
    character: Character;
    tasks: Task[];
    achievements: Achievement[];
    inventory: Item[];
  }): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate character
    if (!data.character.name) {
      errors.push('Character name is required');
    }
    if (!data.character.class) {
      errors.push('Character class is required');
    }

    // Validate tasks
    data.tasks.forEach((task, index) => {
      if (!task.title) {
        errors.push(`Task ${index + 1} is missing a title`);
      }
      if (!task.description) {
        errors.push(`Task ${index + 1} is missing a description`);
      }
    });

    // Validate achievements
    data.achievements.forEach((achievement, index) => {
      if (!achievement.name) {
        errors.push(`Achievement ${index + 1} is missing a name`);
      }
      if (!achievement.description) {
        errors.push(`Achievement ${index + 1} is missing a description`);
      }
    });

    // Validate inventory items
    data.inventory.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Item ${index + 1} is missing a name`);
      }
      if (!item.type) {
        errors.push(`Item ${index + 1} is missing a type`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static async recoverData(userId: string): Promise<{
    character: Character | null;
    tasks: Task[];
    achievements: Achievement[];
    inventory: Item[];
  }> {
    try {
      const [characterDoc, tasksSnapshot, achievementsSnapshot, inventoryDoc] = await Promise.all([
        firestore().collection('characters').doc(userId).get(),
        firestore().collection('tasks').where('userId', '==', userId).get(),
        firestore().collection('achievements').where('userId', '==', userId).get(),
        firestore().collection('inventories').doc(userId).get(),
      ]);

      return {
        character: characterDoc.exists ? (characterDoc.data() as Character) : null,
        tasks: tasksSnapshot.docs.map(doc => doc.data() as Task),
        achievements: achievementsSnapshot.docs.map(doc => doc.data() as Achievement),
        inventory: inventoryDoc.exists ? (inventoryDoc.data()?.items as Item[]) || [] : [],
      };
    } catch (error) {
      console.error('Error recovering data from Firebase:', error);
      throw error;
    }
  }
} 