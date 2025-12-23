"use client";
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      userId: user.id,
      userName: user.fullName || user.username,
      userImage: user.imageUrl,
      timestamp: serverTimestamp(),
    });
  };

  return (
    <div className=" bg-black flex flex-col h-screen max-w-4xl mx-auto">
      <MessageList messages={messages} currentUserId={user?.id} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
