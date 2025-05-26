import { firestore } from '../config/firebase';
import {
  EnhancedTask,
  TaskTemplate,
  TaskCategory,
  TaskStatus,
  CombatAction,
  AttackType,
} from '../types';
import { CharacterService } from './characterService';

export class TaskService {
  private static readonly TASKS_COLLECTION = 'tasks';
  private static readonly TEMPLATES_COLLECTION = 'task_templates';
  private static readonly COMBAT_ACTIONS_COLLECTION = 'combat_actions';

  public static async createTaskFromTemplate(
    templateId: string,
    assignedTo: string,
    partyId: string
  ): Promise<EnhancedTask> {
    const templateDoc = await firestore()
      .collection(this.TEMPLATES_COLLECTION)
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      throw new Error('Task template not found');
    }

    const template = templateDoc.data() as TaskTemplate;
    const task: EnhancedTask = {
      id: firestore().collection(this.TASKS_COLLECTION).doc().id,
      title: template.title,
      description: template.description,
      difficulty: template.difficulty,
      frequency: template.frequency,
      isCustom: false,
      createdAt: new Date(),
      createdBy: assignedTo,
      rewards: template.rewards,
      category: template.category,
      status: 'pending',
      dependencies: template.dependencies,
      template: templateId,
      progress: 0,
      assignedTo,
      partyId,
    };

    await firestore()
      .collection(this.TASKS_COLLECTION)
      .doc(task.id)
      .set(task);

    return task;
  }

  public static async completeTask(
    taskId: string,
    completedBy: string
  ): Promise<CombatAction[]> {
    const taskDoc = await firestore()
      .collection(this.TASKS_COLLECTION)
      .doc(taskId)
      .get();

    if (!taskDoc.exists) {
      throw new Error('Task not found');
    }

    const task = taskDoc.data() as EnhancedTask;
    const character = await CharacterService.getCharacterByUserId(completedBy);
    if (!character) {
      throw new Error('Character not found');
    }

    const combatStats = CharacterService.calculateCombatStats(character);
    const combatActions: CombatAction[] = [];

    // Determine attack type based on task frequency
    let attackType: AttackType;
    let damageMultiplier: number;

    switch (task.frequency) {
      case 'daily':
        attackType = 'basic';
        damageMultiplier = 1;
        break;
      case 'weekly':
        attackType = 'special';
        damageMultiplier = 2;
        break;
      case 'monthly':
        attackType = 'ultimate';
        damageMultiplier = 4;
        break;
    }

    // Create combat actions for each target
    const targets: Array<'encounter' | 'miniBoss' | 'boss'> = ['encounter', 'miniBoss', 'boss'];
    for (const target of targets) {
      let damage: number;
      switch (character.class) {
        case 'Warrior':
        case 'Monk':
          damage = combatStats.meleeDamage * damageMultiplier;
          break;
        case 'Ranger':
        case 'Gunner':
          damage = combatStats.rangedDamage * damageMultiplier;
          break;
        case 'Mage':
        case 'Priest':
        case 'MagicSwordsman':
          damage = combatStats.magicDamage * damageMultiplier;
          break;
        case 'Rogue':
          damage = (combatStats.meleeDamage + combatStats.rangedDamage) / 2 * damageMultiplier;
          break;
      }

      const combatAction: CombatAction = {
        type: attackType,
        damage,
        target,
        characterId: character.id,
        taskId: task.id,
        timestamp: new Date(),
      };

      await firestore()
        .collection(this.COMBAT_ACTIONS_COLLECTION)
        .add(combatAction);

      combatActions.push(combatAction);
    }

    // Update task status
    await firestore()
      .collection(this.TASKS_COLLECTION)
      .doc(taskId)
      .update({
        status: 'completed',
        completedBy,
        completionDate: new Date(),
        combatContribution: {
          damage: combatActions.reduce((sum, action) => sum + action.damage, 0),
          attackType,
          target: 'encounter', // Default target for task completion
        },
      });

    return combatActions;
  }

  public static async getTaskDependencies(taskId: string): Promise<EnhancedTask[]> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const dependencyIds = task.dependencies.map(dep => dep.taskId);
    const dependencies: EnhancedTask[] = [];

    for (const depId of dependencyIds) {
      const depTask = await this.getTask(depId);
      if (depTask) {
        dependencies.push(depTask);
      }
    }

    return dependencies;
  }

  public static async getTask(taskId: string): Promise<EnhancedTask | null> {
    const doc = await firestore()
      .collection(this.TASKS_COLLECTION)
      .doc(taskId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as EnhancedTask;
  }

  public static async getTasksByCategory(
    partyId: string,
    category: TaskCategory
  ): Promise<EnhancedTask[]> {
    const snapshot = await firestore()
      .collection(this.TASKS_COLLECTION)
      .where('partyId', '==', partyId)
      .where('category', '==', category)
      .get();

    return snapshot.docs.map(doc => doc.data() as EnhancedTask);
  }
} 