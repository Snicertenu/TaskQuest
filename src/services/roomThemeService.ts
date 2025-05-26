import { firestore } from '../config/firebase';
import { RoomCustomization } from '../types';

export interface RoomTheme {
  id: string;
  name: string;
  description: string;
  category: 'common' | 'rare' | 'epic' | 'legendary';
  wallpaper: string;
  flooring: string;
  accentColor: string;
  unlockCost: number;
  isUnlocked: boolean;
  previewImage: string;
}

export class RoomThemeService {
  private static readonly THEMES_COLLECTION = 'room_themes';

  public static async getThemes(
    category?: 'common' | 'rare' | 'epic' | 'legendary'
  ): Promise<RoomTheme[]> {
    const query = firestore().collection(this.THEMES_COLLECTION);
    
    if (category) {
      query.where('category', '==', category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RoomTheme[];
  }

  public static async getThemeById(themeId: string): Promise<RoomTheme | null> {
    const doc = await firestore()
      .collection(this.THEMES_COLLECTION)
      .doc(themeId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as RoomTheme;
  }

  public static async unlockTheme(themeId: string, userId: string): Promise<boolean> {
    const theme = await this.getThemeById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // TODO: Check if user has enough currency to unlock
    // TODO: Deduct currency from user
    // TODO: Add theme to user's unlocked themes

    return true;
  }

  public static async applyThemeToRoom(
    baseId: string,
    roomId: string,
    themeId: string
  ): Promise<boolean> {
    const theme = await this.getThemeById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Update room customization with new theme
    await firestore()
      .collection('party_bases')
      .doc(baseId)
      .collection('rooms')
      .doc(roomId)
      .update({
        wallpaper: theme.wallpaper,
        flooring: theme.flooring,
        accentColor: theme.accentColor,
      });

    return true;
  }

  public static getDefaultTheme(): RoomTheme {
    return {
      id: 'default',
      name: 'Default Theme',
      description: 'A clean and simple theme',
      category: 'common',
      wallpaper: '#FFFFFF',
      flooring: '#F5F5F5',
      accentColor: '#2196F3',
      unlockCost: 0,
      isUnlocked: true,
      previewImage: 'default_theme.png',
    };
  }
} 