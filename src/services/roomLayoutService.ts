import { firestore } from '../config/firebase';
import { RoomLayout, FurnitureItem, PartyBase } from '../types';

export class RoomLayoutService {
  private static readonly FURNITURE_COLLECTION = 'furniture_items';
  private static readonly LAYOUT_COLLECTION = 'room_layouts';
  private static furnitureItemsCache: FurnitureItem[] = [];

  public static async getFurnitureItems(
    category?: 'common' | 'rare' | 'epic' | 'legendary'
  ): Promise<FurnitureItem[]> {
    const query = firestore().collection(this.FURNITURE_COLLECTION);
    
    if (category) {
      query.where('category', '==', category);
    }

    const snapshot = await query.get();
    this.furnitureItemsCache = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FurnitureItem[];
    return this.furnitureItemsCache;
  }

  public static async getRoomLayout(baseId: string, roomId: string): Promise<RoomLayout | null> {
    const snapshot = await firestore()
      .collection(this.LAYOUT_COLLECTION)
      .where('baseId', '==', baseId)
      .where('roomId', '==', roomId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as RoomLayout;
  }

  public static async saveRoomLayout(
    baseId: string,
    roomId: string,
    layout: RoomLayout
  ): Promise<void> {
    const layoutRef = firestore()
      .collection(this.LAYOUT_COLLECTION)
      .doc();

    await layoutRef.set({
      ...layout,
      baseId,
      roomId,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update the base document to reference the new layout
    const baseRef = firestore().collection('party_bases').doc(baseId);
    if (roomId === 'common') {
      await baseRef.update({
        'commonRoom.layout': layout,
      });
    } else {
      await baseRef.update({
        [`rooms.${roomId}.layout`]: layout,
      });
    }
  }

  public static async addFurnitureToLayout(
    baseId: string,
    roomId: string,
    furniture: {
      itemId: string;
      x: number;
      y: number;
      rotation: number;
    }
  ): Promise<void> {
    const layout = await this.getRoomLayout(baseId, roomId);
    if (!layout) {
      throw new Error('Room layout not found');
    }

    // Check if the furniture item is unlocked
    const base = await firestore()
      .collection('party_bases')
      .doc(baseId)
      .get();
    
    const baseData = base.data() as PartyBase;
    const furnitureItem = await firestore()
      .collection(this.FURNITURE_COLLECTION)
      .doc(furniture.itemId)
      .get();
    
    const furnitureData = furnitureItem.data() as FurnitureItem;
    if (!baseData.unlockedFurniture[furnitureData.category].includes(furniture.itemId)) {
      throw new Error('Furniture item not unlocked');
    }

    // Check if the position is valid
    if (!this.isValidPosition(layout, furniture)) {
      throw new Error('Invalid furniture position');
    }

    // Add furniture to layout
    layout.furniture.push(furniture);
    await this.saveRoomLayout(baseId, roomId, layout);
  }

  public static async removeFurnitureFromLayout(
    baseId: string,
    roomId: string,
    furnitureId: string
  ): Promise<void> {
    const layout = await this.getRoomLayout(baseId, roomId);
    if (!layout) {
      throw new Error('Room layout not found');
    }

    layout.furniture = layout.furniture.filter(f => f.itemId !== furnitureId);
    await this.saveRoomLayout(baseId, roomId, layout);
  }

  public static async updateFurniturePosition(
    baseId: string,
    roomId: string,
    furnitureId: string,
    newPosition: {
      x: number;
      y: number;
      rotation: number;
    }
  ): Promise<void> {
    const layout = await this.getRoomLayout(baseId, roomId);
    if (!layout) {
      throw new Error('Room layout not found');
    }

    const furnitureIndex = layout.furniture.findIndex(f => f.itemId === furnitureId);
    if (furnitureIndex === -1) {
      throw new Error('Furniture not found in layout');
    }

    // Check if the new position is valid
    if (!this.isValidPosition(layout, { ...layout.furniture[furnitureIndex], ...newPosition })) {
      throw new Error('Invalid furniture position');
    }

    layout.furniture[furnitureIndex] = {
      ...layout.furniture[furnitureIndex],
      ...newPosition,
    };

    await this.saveRoomLayout(baseId, roomId, layout);
  }

  private static isValidPosition(
    layout: RoomLayout,
    furniture: {
      itemId: string;
      x: number;
      y: number;
      rotation: number;
    }
  ): boolean {
    // Get furniture item dimensions
    const furnitureItem = layout.furniture.find(f => f.itemId === furniture.itemId);
    if (!furnitureItem) {
      return false;
    }

    // Get the actual furniture item data to check dimensions
    const furnitureData = this.furnitureItemsCache.find(f => f.id === furniture.itemId);
    if (!furnitureData) {
      return false;
    }

    // Check if the furniture is within room boundaries
    if (
      furniture.x < 0 ||
      furniture.y < 0 ||
      furniture.x + furnitureData.width > layout.width ||
      furniture.y + furnitureData.height > layout.height
    ) {
      return false;
    }

    // Check for collisions with other furniture
    for (const otherFurniture of layout.furniture) {
      if (otherFurniture.itemId === furniture.itemId) continue;

      const otherFurnitureData = this.furnitureItemsCache.find(f => f.id === otherFurniture.itemId);
      if (!otherFurnitureData) continue;

      if (this.checkCollision(
        { ...furniture, width: furnitureData.width, height: furnitureData.height },
        { ...otherFurniture, width: otherFurnitureData.width, height: otherFurnitureData.height }
      )) {
        return false;
      }
    }

    return true;
  }

  private static checkCollision(
    furniture1: { x: number; y: number; width: number; height: number },
    furniture2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      furniture1.x + furniture1.width <= furniture2.x ||
      furniture1.x >= furniture2.x + furniture2.width ||
      furniture1.y + furniture1.height <= furniture2.y ||
      furniture1.y >= furniture2.y + furniture2.height
    );
  }
} 