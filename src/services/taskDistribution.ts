import { Task, PartyMember } from '../types';

interface TaskAssignment {
  taskId: string;
  memberId: string;
  score: number;
}

interface MemberWorkload {
  memberId: string;
  totalDifficulty: number;
  taskCount: number;
}

export class TaskDistributor {
  private static readonly DIFFICULTY_WEIGHTS = {
    easy: 1,
    medium: 2,
    hard: 3,
    very_hard: 4,
  };

  private static calculateMemberWorkload(members: PartyMember[], tasks: Task[]): MemberWorkload[] {
    return members.map(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.id);
      const totalDifficulty = memberTasks.reduce((sum, task) => {
        return sum + TaskDistributor.DIFFICULTY_WEIGHTS[task.difficulty];
      }, 0);

      return {
        memberId: member.id,
        totalDifficulty,
        taskCount: memberTasks.length,
      };
    });
  }

  private static calculateTaskScore(
    task: Task,
    member: PartyMember,
    workload: MemberWorkload
  ): number {
    // Base score is inverse of current workload
    const workloadScore = 1 / (workload.totalDifficulty + 1);

    // Consider member's level for task difficulty
    const levelScore = member.level / TaskDistributor.DIFFICULTY_WEIGHTS[task.difficulty];

    // Consider task frequency
    const frequencyScore = task.frequency === 'daily' ? 1.2 : task.frequency === 'weekly' ? 1 : 0.8;

    // Combine scores with weights
    return (workloadScore * 0.4) + (levelScore * 0.4) + (frequencyScore * 0.2);
  }

  public static distributeTasks(tasks: Task[], members: PartyMember[]): TaskAssignment[] {
    const unassignedTasks = tasks.filter(task => !task.assignedTo);
    const assignments: TaskAssignment[] = [];
    const workloads = this.calculateMemberWorkload(members, tasks);

    // Sort tasks by difficulty (harder tasks first)
    unassignedTasks.sort((a, b) => {
      return (
        TaskDistributor.DIFFICULTY_WEIGHTS[b.difficulty] -
        TaskDistributor.DIFFICULTY_WEIGHTS[a.difficulty]
      );
    });

    for (const task of unassignedTasks) {
      const taskScores: TaskAssignment[] = members.map(member => {
        const memberWorkload = workloads.find(w => w.memberId === member.id)!;
        const score = this.calculateTaskScore(task, member, memberWorkload);

        return {
          taskId: task.id,
          memberId: member.id,
          score,
        };
      });

      // Sort by score in descending order
      taskScores.sort((a, b) => b.score - a.score);

      // Assign task to member with highest score
      const bestAssignment = taskScores[0];
      assignments.push(bestAssignment);

      // Update workload for the assigned member
      const memberWorkload = workloads.find(w => w.memberId === bestAssignment.memberId)!;
      memberWorkload.totalDifficulty += TaskDistributor.DIFFICULTY_WEIGHTS[task.difficulty];
      memberWorkload.taskCount += 1;
    }

    return assignments;
  }

  public static validateDistribution(assignments: TaskAssignment[], tasks: Task[], members: PartyMember[]): boolean {
    const workloads = this.calculateMemberWorkload(members, tasks);
    const maxWorkload = Math.max(...workloads.map(w => w.totalDifficulty));
    const minWorkload = Math.min(...workloads.map(w => w.totalDifficulty));

    // Check if workload difference is within acceptable range (e.g., 20%)
    const workloadDifference = (maxWorkload - minWorkload) / maxWorkload;
    return workloadDifference <= 0.2;
  }
} 