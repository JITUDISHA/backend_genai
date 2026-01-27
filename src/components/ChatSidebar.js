"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useUserStatus } from '@/hooks/useUserStatus';

function ChatItem({ chat, userId, onClick, isActive }) {
  const otherUser = getOtherUser(chat, userId);
  const { isOnline } = useUserStatus(otherUser?.id);

  function getOtherUser(chat, currentUserId) {
    const otherUserId = chat.participants.find(id => id !== currentUserId);
    return { ...chat.participantDetails[otherUserId], id: otherUserId };
  }

  return (
    <div
      onClick={onClick}
      // Active State: Gold Background, Black Text, Hard Shadow
      // Inactive State: Transparent, White Text
      className={`relative mx-3 my-2 p-3 cursor-pointer transition-all duration-200 rounded-xl border-2 ${
        isActive 
          ? 'bg-[#EBB048] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
          : 'border-transparent hover:bg-white/10 hover:border-white/20 text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* User Avatar with Hard Border */}
        <div className="relative flex-shrink-0">
          <img
            src={otherUser.image}
            alt={otherUser.name}
            className={`w-12 h-12 rounded-full object-cover border-2 ${
               isActive ? 'border-black' : 'border-white/50'
            }`}
          />
          {/* Status Dot */}
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-black rounded-full`}></span>
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className={`font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>
              {otherUser.name}
            </p>
            {chat.lastMessageTime && (
              <span className={`text-xs font-medium flex-shrink-0 ml-2 ${isActive ? 'text-black/70' : 'text-white/50'}`}>
                {formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true }).replace('about ', '')}
              </span>
            )}
          </div>
          
          {chat.lastMessage && (
            <div className="flex items-center gap-2">
              <p className={`text-sm truncate flex-1 ${isActive ? 'text-black/80 font-medium' : 'text-white/60'}`}>
                {chat.lastMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatSidebar({ userId }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(db, 'chats');
    
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      const sortedChats = chatsData.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
      });
      
      setChats(sortedChats);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="p-5 border-b-2 border-black/10 md:block hidden">
        <div className="flex items-center gap-3">
          {/* Icon Box */}
          <div className="w-10 h-10 bg-[#EBB048] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-bokor)' }}>Messages</h2>
            <p className="text-xs text-[#EBB048] font-bold tracking-wider uppercase">{chats.length} Active</p>
          </div>
        </div>
      </div>

      {/* Search Bar - Neo Brutal Input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#8B2510] border-2 border-black/30 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#EBB048] focus:bg-[#5a1608] transition-all shadow-inner"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-60">
            <div className="w-16 h-16 bg-black/20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-white font-bold mb-1">No chats yet</p>
            <p className="text-white/50 text-sm">Start a new conversation below</p>
          </div>
        ) : (
          <div>
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                userId={userId}
                onClick={() => handleChatClick(chat.id)}
                isActive={activeChat === chat.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with Quick Actions - Desktop Only */}
      <div className="p-4 border-t-2 border-black/10 hidden md:block">
        <button 
          onClick={() => router.push('/chat')}
          // PostPilot Style Button: Bright Orange/Gold, Hard Border, Hard Shadow
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#ff5f2e] text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="uppercase tracking-wide text-sm">New Chat</span>
        </button>
      </div>
    </div>
  );
}