import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Generate consistent chat ID for two users
export function generateChatId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

// Get or create a chat between two users
export async function getOrCreateChat(currentUserId, otherUserId, currentUserData, otherUserData) {
  const chatId = generateChatId(currentUserId, otherUserId);
  const chatRef = doc(db, 'chats', chatId);
  
  // Check if chat exists
  const chatDoc = await getDoc(chatRef);
  
  if (!chatDoc.exists()) {
    // Create new chat
    await setDoc(chatRef, {
      participants: [currentUserId, otherUserId],
      participantDetails: {
        [currentUserId]: {
          id: currentUserId,
          name: currentUserData.name,
          image: currentUserData.image,
        },
        [otherUserId]: {
          id: otherUserId,
          name: otherUserData.name,
          image: otherUserData.image,
        },
      },
      lastMessage: null,
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  
  return chatId;
}

// Get all chats for a user
export async function getUserChats(userId) {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
