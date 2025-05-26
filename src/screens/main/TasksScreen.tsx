import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { Task, TaskDifficulty, TaskFrequency } from '../../types';

type Props = NativeStackScreenProps<MainTabParamList, 'Tasks'>;

export default function TasksScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Clean Bathroom',
      description: 'Clean the bathroom thoroughly',
      difficulty: 'medium',
      frequency: 'weekly',
      isCustom: false,
      createdAt: new Date(),
      createdBy: 'system',
    },
    {
      id: '2',
      title: 'Cook Dinner',
      description: 'Prepare dinner for the family',
      difficulty: 'hard',
      frequency: 'daily',
      isCustom: false,
      createdAt: new Date(),
      createdBy: 'system',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as TaskDifficulty,
    frequency: 'daily' as TaskFrequency,
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      isCustom: true,
      createdAt: new Date(),
      createdBy: 'user', // TODO: Replace with actual user ID
    };

    setTasks([...tasks, task]);
    setModalVisible(false);
    setNewTask({
      title: '',
      description: '',
      difficulty: 'medium',
      frequency: 'daily',
    });
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.difficultyBadge, styles[item.difficulty]]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.frequencyBadge}>
          <Text style={styles.frequencyText}>{item.frequency}</Text>
        </View>
        {item.assignedTo ? (
          <Text style={styles.assignedText}>Assigned to: {item.assignedTo}</Text>
        ) : (
          <TouchableOpacity style={styles.assignButton}>
            <Text style={styles.assignButtonText}>Assign to Me</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
              multiline
              numberOfLines={4}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addTaskButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  easy: {
    backgroundColor: '#4CAF50',
  },
  medium: {
    backgroundColor: '#FFC107',
  },
  hard: {
    backgroundColor: '#FF5722',
  },
  very_hard: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  frequencyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  frequencyText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  assignedText: {
    fontSize: 12,
    color: '#666',
  },
  assignButton: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#f4511e',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  addTaskButton: {
    backgroundColor: '#f4511e',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 