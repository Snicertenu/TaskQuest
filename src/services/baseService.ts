import { firestore } from '../config/firebase';
import { PartyBase, BaseType, BaseCustomization, RoomCustomization } from '../types';

export class BaseService {
  private static readonly BASE_COLLECTION = 'party_bases';
  private static readonly CUSTOMIZATION_COLLECTION = 'base_customizations';

  public static async createBase(
    partyId: string,
    type: BaseType,
    name: string
  ): Promise<PartyBase> {
    const base: PartyBase = {
      id: firestore().collection(this.BASE_COLLECTION).doc().id,
      partyId,
      type,
      name,
      level: 1,
      commonRoom: {
        customizations: [],
        activeMembers: [],
      },
      rooms: {},
      unlockedCustomizations: {
        common: [],
        rare: [],
        epic: [],
        legendary: [],
      },
    };

    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(base.id)
      .set(base);

    return base;
  }

  public static async getBase(partyId: string): Promise<PartyBase | null> {
    const snapshot = await firestore()
      .collection(this.BASE_COLLECTION)
      .where('partyId', '==', partyId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as PartyBase;
  }

  public static async updateBaseCustomization(
    baseId: string,
    customization: BaseCustomization
  ): Promise<void> {
    const baseRef = firestore().collection(this.BASE_COLLECTION).doc(baseId);
    const base = await baseRef.get();
    const baseData = base.data() as PartyBase;

    // Check if customization is already unlocked
    if (baseData.unlockedCustomizations[customization.category].includes(customization.id)) {
      throw new Error('Customization already unlocked');
    }

    // Add customization to common room
    await baseRef.update({
      'commonRoom.customizations': firestore.FieldValue.arrayUnion(customization),
      [`unlockedCustomizations.${customization.category}`]: firestore.FieldValue.arrayUnion(customization.id),
    });
  }

  public static async updateRoomCustomization(
    baseId: string,
    memberId: string,
    customization: RoomCustomization
  ): Promise<void> {
    const baseRef = firestore().collection(this.BASE_COLLECTION).doc(baseId);
    const base = await baseRef.get();
    const baseData = base.data() as PartyBase;

    // Check if customization is already unlocked
    if (baseData.unlockedCustomizations[customization.category].includes(customization.id)) {
      throw new Error('Customization already unlocked');
    }

    // Initialize member's room if it doesn't exist
    if (!baseData.rooms[memberId]) {
      await baseRef.update({
        [`rooms.${memberId}`]: {
          customizations: [],
          isPrivate: false,
        },
      });
    }

    // Add customization to member's room
    await baseRef.update({
      [`rooms.${memberId}.customizations`]: firestore.FieldValue.arrayUnion(customization),
      [`unlockedCustomizations.${customization.category}`]: firestore.FieldValue.arrayUnion(customization.id),
    });
  }

  public static async setRoomPrivacy(
    baseId: string,
    memberId: string,
    isPrivate: boolean
  ): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .update({
        [`rooms.${memberId}.isPrivate`]: isPrivate,
      });
  }

  public static async enterCommonRoom(baseId: string, memberId: string): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .update({
        'commonRoom.activeMembers': firestore.FieldValue.arrayUnion(memberId),
      });
  }

  public static async leaveCommonRoom(baseId: string, memberId: string): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .update({
        'commonRoom.activeMembers': firestore.FieldValue.arrayRemove(memberId),
      });
  }

  public static async getAvailableCustomizations(
    type: 'base' | 'room',
    category?: 'common' | 'rare' | 'epic' | 'legendary'
  ): Promise<(BaseCustomization | RoomCustomization)[]> {
    let query = firestore()
      .collection(this.CUSTOMIZATION_COLLECTION)
      .where('type', '==', type);

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as BaseCustomization | RoomCustomization);
  }

  public static async upgradeBase(baseId: string): Promise<void> {
    const baseRef = firestore().collection(this.BASE_COLLECTION).doc(baseId);
    const base = await baseRef.get();
    const baseData = base.data() as PartyBase;

    // Add upgrade logic here (e.g., cost calculation, level requirements)
    await baseRef.update({
      level: firestore.FieldValue.increment(1),
    });
  }

  public static async updateBaseType(baseId: string, newType: BaseType): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .update({
        type: newType,
      });
  }

  public static async updateBaseName(baseId: string, newName: string): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .update({
        name: newName,
      });
  }

  public static async getBaseChat(baseId: string): Promise<{
    messages: Array<{
      id: string;
      senderId: string;
      senderName: string;
      content: string;
      timestamp: Date;
    }>;
  }> {
    const snapshot = await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .collection('chat')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    return {
      messages: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })),
    };
  }

  public static async sendChatMessage(
    baseId: string,
    senderId: string,
    senderName: string,
    content: string
  ): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .collection('chat')
      .add({
        senderId,
        senderName,
        content,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
  }

  public static async getBaseActivities(baseId: string): Promise<{
    activities: Array<{
      id: string;
      type: 'task' | 'achievement' | 'customization' | 'upgrade';
      memberId: string;
      memberName: string;
      description: string;
      timestamp: Date;
    }>;
  }> {
    const snapshot = await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    return {
      activities: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })),
    };
  }

  public static async addBaseActivity(
    baseId: string,
    type: 'task' | 'achievement' | 'customization' | 'upgrade',
    memberId: string,
    memberName: string,
    description: string
  ): Promise<void> {
    await firestore()
      .collection(this.BASE_COLLECTION)
      .doc(baseId)
      .collection('activities')
      .add({
        type,
        memberId,
        memberName,
        description,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
  }
} 