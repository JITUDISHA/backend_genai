import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Send friend request
export async function sendFriendRequest(fromUserId, toUserId, fromUserData, toUserData) {
  try {
    const existingRequest = await checkExistingRequest(fromUserId, toUserId);
    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    const areFriends = await checkIfFriends(fromUserId, toUserId);
    if (areFriends) {
      throw new Error('Already friends');
    }

    const requestRef = await addDoc(collection(db, 'friendRequests'), {
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      fromUserData: {
        name: fromUserData.name,
        image: fromUserData.image,
      },
      toUserData: {
        name: toUserData.name,
        image: toUserData.image,
      },
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      type: 'friend_request',
      fromUserId: fromUserId,
      fromUserName: fromUserData.name,
      fromUserImage: fromUserData.image,
      requestId: requestRef.id,
      read: false,
      createdAt: serverTimestamp(),
    });

    return requestRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

// Check if request already exists
async function checkExistingRequest(userId1, userId2) {
  const q1 = query(
    collection(db, 'friendRequests'),
    where('from', '==', userId1),
    where('to', '==', userId2),
    where('status', '==', 'pending')
  );
  
  const snapshot1 = await getDocs(q1);
  if (!snapshot1.empty) return true;

  const q2 = query(
    collection(db, 'friendRequests'),
    where('from', '==', userId2),
    where('to', '==', userId1),
    where('status', '==', 'pending')
  );
  
  const snapshot2 = await getDocs(q2);
  return !snapshot2.empty;
}

// Check if already friends
export async function checkIfFriends(userId1, userId2) {
  const friendshipId = [userId1, userId2].sort().join('_');
  const friendshipRef = doc(db, 'friends', friendshipId);
  const friendshipDoc = await getDoc(friendshipRef);
  return friendshipDoc.exists();
}

// Accept friend request
export async function acceptFriendRequest(requestId, currentUserId) {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }

    const requestData = requestDoc.data();
    
    const friendshipId = [requestData.from, requestData.to].sort().join('_');
    await setDoc(doc(db, 'friends', friendshipId), {
      users: [requestData.from, requestData.to],
      userDetails: {
        [requestData.from]: requestData.fromUserData,
        [requestData.to]: requestData.toUserData,
      },
      createdAt: serverTimestamp(),
    });

    await updateDoc(requestRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });

    const notifQuery = query(
      collection(db, 'notifications'),
      where('requestId', '==', requestId)
    );
    const notifSnapshot = await getDocs(notifQuery);
    notifSnapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { read: true });
    });

    await addDoc(collection(db, 'notifications'), {
      userId: requestData.from,
      type: 'friend_accepted',
      fromUserId: currentUserId,
      fromUserName: requestData.toUserData.name,
      fromUserImage: requestData.toUserData.image,
      read: false,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

// Reject friend request
export async function rejectFriendRequest(requestId) {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    });

    const notifQuery = query(
      collection(db, 'notifications'),
      where('requestId', '==', requestId)
    );
    const notifSnapshot = await getDocs(notifQuery);
    notifSnapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { read: true });
    });

    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

// Get user's friends
export async function getUserFriends(userId) {
  const q = query(
    collection(db, 'friends'),
    where('users', 'array-contains', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get pending friend requests (received)
export async function getPendingRequests(userId) {
  const q = query(
    collection(db, 'friendRequests'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get sent friend requests
export async function getSentRequests(userId) {
  const q = query(
    collection(db, 'friendRequests'),
    where('from', '==', userId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get friendship status
export async function getFriendshipStatus(currentUserId, otherUserId) {
  const areFriends = await checkIfFriends(currentUserId, otherUserId);
  if (areFriends) return 'friends';

  const sentQ = query(
    collection(db, 'friendRequests'),
    where('from', '==', currentUserId),
    where('to', '==', otherUserId),
    where('status', '==', 'pending')
  );
  const sentSnapshot = await getDocs(sentQ);
  if (!sentSnapshot.empty) return 'request_sent';

  const receivedQ = query(
    collection(db, 'friendRequests'),
    where('from', '==', otherUserId),
    where('to', '==', currentUserId),
    where('status', '==', 'pending')
  );
  const receivedSnapshot = await getDocs(receivedQ);
  if (!receivedSnapshot.empty) return 'request_received';

  return 'not_friends';
}

// Remove friend (ONLY ONE - Complete version with cleanup)
export async function removeFriend(currentUserId, friendUserId) {
  try {
    const friendshipId = [currentUserId, friendUserId].sort().join('_');
    const friendshipRef = doc(db, 'friends', friendshipId);
    
    await deleteDoc(friendshipRef);
    
    const notifQuery1 = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUserId),
      where('fromUserId', '==', friendUserId)
    );
    
    const notifQuery2 = query(
      collection(db, 'notifications'),
      where('userId', '==', friendUserId),
      where('fromUserId', '==', currentUserId)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(notifQuery1),
      getDocs(notifQuery2)
    ]);
    
    const batch = writeBatch(db);
    
    snapshot1.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    snapshot2.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    const requestQuery1 = query(
      collection(db, 'friendRequests'),
      where('from', '==', currentUserId),
      where('to', '==', friendUserId)
    );
    
    const requestQuery2 = query(
      collection(db, 'friendRequests'),
      where('from', '==', friendUserId),
      where('to', '==', currentUserId)
    );
    
    const [reqSnapshot1, reqSnapshot2] = await Promise.all([
      getDocs(requestQuery1),
      getDocs(requestQuery2)
    ]);
    
    reqSnapshot1.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    reqSnapshot2.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

// Set nickname for a friend
export async function setFriendNickname(currentUserId, friendUserId, nickname) {
  try {
    const friendshipId = [currentUserId, friendUserId].sort().join('_');
    const friendshipRef = doc(db, 'friends', friendshipId);
    
    const friendshipDoc = await getDoc(friendshipRef);
    if (!friendshipDoc.exists()) {
      throw new Error('Not friends');
    }
    
    await updateDoc(friendshipRef, {
      [`nicknames.${currentUserId}`]: nickname,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error setting nickname:', error);
    throw error;
  }
}

// Get friend nickname
export async function getFriendNickname(currentUserId, friendUserId) {
  try {
    const friendshipId = [currentUserId, friendUserId].sort().join('_');
    const friendshipRef = doc(db, 'friends', friendshipId);
    
    const friendshipDoc = await getDoc(friendshipRef);
    if (!friendshipDoc.exists()) {
      return null;
    }
    
    const data = friendshipDoc.data();
    return data.nicknames?.[currentUserId] || null;
  } catch (error) {
    console.error('Error getting nickname:', error);
    return null;
  }
}

// Clear chat messages
export async function clearChat(chatId) {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    
    const batch = writeBatch(db);
    
    messagesSnapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    const chatRef = doc(db, 'chats', chatId);
    batch.update(chatRef, {
      lastMessage: null,
      lastMessageTime: serverTimestamp(),
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error clearing chat:', error);
    throw error;
  }
}
