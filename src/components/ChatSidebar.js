"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ChatSidebar({ userId }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const getOtherUser = (chat) => {
    const otherUserId = chat.participants.find(id => id !== userId);
    return chat.participantDetails[otherUserId];
  };

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-slate-800">
      {/* Header with Gradient */}
      <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-slate-800 to-gray-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Messages</h2>
            <p className="text-xs text-gray-400">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-300 font-semibold mb-2">No conversations yet</p>
            <p className="text-gray-500 text-sm">Start chatting with someone to see your conversations here</p>
          </div>
        ) : (
          <div>
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const isActive = activeChat === chat.id;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-transparent border-blue-500' 
                      : 'border-transparent hover:bg-gray-700/40 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar with Online Status */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUser.image}
                        alt={otherUser.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 transition-all ${
                          isActive ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-gray-600'
                        }`}
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold truncate transition-colors ${
                          isActive ? 'text-blue-400' : 'text-gray-100'
                        }`}>
                          {otherUser.name}
                        </p>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true }).replace('about ', '')}
                          </span>
                        )}
                      </div>
                      
                      {chat.lastMessage && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400 truncate flex-1">
                            {chat.lastMessage}
                          </p>
                          {/* Unread Badge (optional - you can implement unread count) */}
                          {/* <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">3</span> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with Quick Actions */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">New Chat</span>
        </button>
      </div>
    </div>
  );
}
