import { auth, firestore } from '../config/firebase';
import { Party, PartyMember, Task, Adventure } from '../types';

// Authentication
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: name });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

// Party Operations
export const createParty = async (partyName: string, creatorId: string) => {
  try {
    const partyRef = firestore().collection('parties').doc();
    const party: Party = {
      id: partyRef.id,
      name: partyName,
      members: [],
      taskList: [],
      createdAt: new Date(),
    };
    await partyRef.set(party);
    return party;
  } catch (error) {
    throw error;
  }
};

export const joinParty = async (partyCode: string, member: PartyMember) => {
  try {
    const partyRef = firestore().collection('parties').doc(partyCode);
    const partyDoc = await partyRef.get();
    
    if (!partyDoc.exists) {
      throw new Error('Party not found');
    }

    const party = partyDoc.data() as Party;
    party.members.push(member);
    await partyRef.update({ members: party.members });
    return party;
  } catch (error) {
    throw error;
  }
};

// Task Operations
export const createTask = async (partyId: string, task: Task) => {
  try {
    const taskRef = firestore().collection('parties').doc(partyId).collection('tasks').doc();
    const newTask = { ...task, id: taskRef.id };
    await taskRef.set(newTask);
    return newTask;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (partyId: string, taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = firestore().collection('parties').doc(partyId).collection('tasks').doc(taskId);
    await taskRef.update(updates);
  } catch (error) {
    throw error;
  }
};

// Adventure Operations
export const createAdventure = async (partyId: string, adventure: Adventure) => {
  try {
    const adventureRef = firestore().collection('parties').doc(partyId).collection('adventures').doc();
    const newAdventure = { ...adventure, id: adventureRef.id };
    await adventureRef.set(newAdventure);
    return newAdventure;
  } catch (error) {
    throw error;
  }
};

export const voteForAdventure = async (partyId: string, adventureId: string, memberId: string) => {
  try {
    const voteRef = firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventures')
      .doc(adventureId)
      .collection('votes')
      .doc(memberId);
    
    await voteRef.set({ timestamp: firestore.FieldValue.serverTimestamp() });
  } catch (error) {
    throw error;
  }
};

// Real-time listeners
export const subscribeToParty = (partyId: string, callback: (party: Party) => void) => {
  return firestore()
    .collection('parties')
    .doc(partyId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data() as Party);
      }
    });
};

export const subscribeToTasks = (partyId: string, callback: (tasks: Task[]) => void) => {
  return firestore()
    .collection('parties')
    .doc(partyId)
    .collection('tasks')
    .onSnapshot((snapshot) => {
      const tasks = snapshot.docs.map((doc) => doc.data() as Task);
      callback(tasks);
    });
}; 