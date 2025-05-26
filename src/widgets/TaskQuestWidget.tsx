import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task, PartyMember } from '../types';
import { StorageService } from '../services/storage';

interface TaskQuestWidgetProps {
  onPress?: () => void;
}

export const TaskQuestWidget: React.FC<TaskQuestWidgetProps> = ({ onPress }) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [member, setMember] = React.useState<PartyMember | null>(null);

  React.useEffect(() => {
    loadWidgetData();
  }, []);

  const loadWidgetData = async () => {
    try {
      const [loadedTasks, loadedMember] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getMember(),
      ]);

      setTasks(loadedTasks);
      setMember(loadedMember);
    } catch (error) {
      console.error('Error loading widget data:', error);
    }
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.completedAt);
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.completedAt);
  };

  const renderTaskCount = () => {
    const pendingTasks = getPendingTasks();
    const completedTasks = getCompletedTasks();

    return (
      <View style={styles.taskCountContainer}>
        <View style={styles.taskCount}>
          <Text style={styles.taskCountNumber}>{pendingTasks.length}</Text>
          <Text style={styles.taskCountLabel}>Pending</Text>
        </View>
        <View style={styles.taskCount}>
          <Text style={styles.taskCountNumber}>{completedTasks.length}</Text>
          <Text style={styles.taskCountLabel}>Completed</Text>
        </View>
      </View>
    );
  };

  const renderMemberStats = () => {
    if (!member) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>Lvl {member.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{member.xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{member.gold}</Text>
          <Text style={styles.statLabel}>Gold</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>TaskQuest</Text>
      {renderTaskCount()}
      {renderMemberStats()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  taskCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  taskCount: {
    alignItems: 'center',
  },
  taskCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  taskCountLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
}); 