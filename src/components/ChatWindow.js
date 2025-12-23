"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import PrivateMessageList from './PrivateMessageList';
import PrivateMessageInput from './PrivateMessageInput';

export default function ChatWindow({ chatId, currentUserId }) {
  const [chatData, setChatData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchChatData();
  }, [chatId]);

  const fetchChatData = async () => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        setChatData(data);
        
        const otherUserId = data.participants.find(id => id !== currentUserId);
        setOtherUser(data.participantDetails[otherUserId]);
      } else {
        console.error('Chat not found');
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-200 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chatData || !otherUser) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <p className="text-gray-200 text-lg font-semibold mb-4">Chat not found</p>
          <button 
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900">
      {/* Chat Header - Dark Gradient */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white p-4 flex items-center gap-3 shadow-xl border-b border-gray-700">
        <button
          onClick={() => router.push('/chat')}
          className="hover:bg-white/10 p-2 rounded-lg transition mr-1"
          title="Back to chats"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div className="relative">
          <img
            src={otherUser.image}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></span>
        </div>
        
        <div className="flex-1">
          <h2 className="font-bold text-lg text-white">{otherUser.name}</h2>
          <p className="text-xs text-gray-300 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>

        <button className="hover:bg-white/10 p-2 rounded-lg transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <PrivateMessageList 
        chatId={chatId} 
        currentUserId={currentUserId}
      />

      {/* Message Input */}
      <PrivateMessageInput 
        chatId={chatId}
        currentUserId={currentUserId}
        currentUserName={user?.fullName || user?.username || 'Anonymous'}
        currentUserImage={user?.imageUrl || ''}
      />
    </div>
  );
}
