import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character, Task, Achievement, Item } from '../types';
import { LocalStorageService } from '../services/localStorageService';

interface LocalStorageContextType {
  character: Character | null;
  tasks: Task[];
  achievements: Achievement[];
  inventory: Item[];
  settings: {
    soundEnabled: boolean;
    volume: number;
    notificationsEnabled: boolean;
  };
  isLocalMode: boolean;
  setCharacter: (character: Character) => Promise<void>;
  setTasks: (tasks: Task[]) => Promise<void>;
  setAchievements: (achievements: Achievement[]) => Promise<void>;
  setInventory: (items: Item[]) => Promise<void>;
  setSettings: (settings: {
    soundEnabled: boolean;
    volume: number;
    notificationsEnabled: boolean;
  }) => Promise<void>;
  syncWithFirebase: (userId: string) => Promise<void>;
  clearLocalData: () => Promise<void>;
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

export const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character | null>(null);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [achievements, setAchievementsState] = useState<Achievement[]>([]);
  const [inventory, setInventoryState] = useState<Item[]>([]);
  const [settings, setSettingsState] = useState({
    soundEnabled: true,
    volume: 1.0,
    notificationsEnabled: true,
  });
  const [isLocalMode, setIsLocalMode] = useState(true);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = async () => {
    const [localCharacter, localTasks, localAchievements, localInventory, localSettings] = await Promise.all([
      LocalStorageService.getLocalCharacter(),
      LocalStorageService.getLocalTasks(),
      LocalStorageService.getLocalAchievements(),
      LocalStorageService.getLocalInventory(),
      LocalStorageService.getLocalSettings(),
    ]);

    setCharacterState(localCharacter);
    setTasksState(localTasks);
    setAchievementsState(localAchievements);
    setInventoryState(localInventory);
    setSettingsState(localSettings);
    setIsLocalMode(!localCharacter?.userId);
  };

  const setCharacter = async (newCharacter: Character) => {
    await LocalStorageService.saveLocalCharacter(newCharacter);
    setCharacterState(newCharacter);
    setIsLocalMode(!newCharacter.userId);
  };

  const setTasks = async (newTasks: Task[]) => {
    await LocalStorageService.saveLocalTasks(newTasks);
    setTasksState(newTasks);
  };

  const setAchievements = async (newAchievements: Achievement[]) => {
    await LocalStorageService.saveLocalAchievements(newAchievements);
    setAchievementsState(newAchievements);
  };

  const setInventory = async (newInventory: Item[]) => {
    await LocalStorageService.saveLocalInventory(newInventory);
    setInventoryState(newInventory);
  };

  const setSettings = async (newSettings: {
    soundEnabled: boolean;
    volume: number;
    notificationsEnabled: boolean;
  }) => {
    await LocalStorageService.saveLocalSettings(newSettings);
    setSettingsState(newSettings);
  };

  const syncWithFirebase = async (userId: string) => {
    await LocalStorageService.syncWithFirebase(userId);
    await loadLocalData();
  };

  const clearLocalData = async () => {
    await LocalStorageService.clearLocalData();
    setCharacterState(null);
    setTasksState([]);
    setAchievementsState([]);
    setInventoryState([]);
    setSettingsState({
      soundEnabled: true,
      volume: 1.0,
      notificationsEnabled: true,
    });
    setIsLocalMode(true);
  };

  return (
    <LocalStorageContext.Provider
      value={{
        character,
        tasks,
        achievements,
        inventory,
        settings,
        isLocalMode,
        setCharacter,
        setTasks,
        setAchievements,
        setInventory,
        setSettings,
        syncWithFirebase,
        clearLocalData,
      }}
    >
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorage = () => {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error('useLocalStorage must be used within a LocalStorageProvider');
  }
  return context;
}; 