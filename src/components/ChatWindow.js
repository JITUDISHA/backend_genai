"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import PrivateMessageList from './PrivateMessageList';
import PrivateMessageInput from './PrivateMessageInput';
import { useUserStatus } from '@/hooks/useUserStatus';
import { getFriendNickname, checkIfFriends } from '@/lib/friendUtils';
import { formatDistanceToNow } from 'date-fns';
import ChatOptionsMenu from './ChatOptionsMenu';
import { Bokor } from 'next/font/google';

// Font Configuration
const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function ChatWindow({ chatId, currentUserId }) {
  const [chatData, setChatData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUserId, setOtherUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [areFriends, setAreFriends] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  
  // Get other user's online status
  const { isOnline, lastSeen, loading: statusLoading } = useUserStatus(otherUserId);

  useEffect(() => {
    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    if (otherUserId && otherUser) {
      loadNickname();
      checkFriendshipStatus();
    }
  }, [otherUserId, otherUser]);

  // Real-time friendship check
  useEffect(() => {
    if (!otherUserId) return;

    const intervalId = setInterval(() => {
      checkFriendshipStatus();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [otherUserId]);

  const checkFriendshipStatus = async () => {
    if (!otherUserId) return;
    const friendsStatus = await checkIfFriends(currentUserId, otherUserId);
    setAreFriends(friendsStatus);
  };

  const loadNickname = async () => {
    const nickname = await getFriendNickname(currentUserId, otherUserId);
    setDisplayName(nickname || otherUser.name);
  };

  const fetchChatData = async () => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        setChatData(data);
        
        const userId = data.participants.find(id => id !== currentUserId);
        setOtherUserId(userId);
        setOtherUser(data.participantDetails[userId]);
        setDisplayName(data.participantDetails[userId].name);
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

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className={`${boko_font.variable} flex items-center justify-center h-full bg-[#8B2510] relative overflow-hidden`}>
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        
        <div className="text-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#EBB048] mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"></div>
          <p className="text-white font-medium tracking-wide" style={{ fontFamily: 'var(--font-bokor)' }}>Loading chat...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!chatData || !otherUser) {
    return (
      <div className={`${boko_font.variable} flex items-center justify-center h-full bg-[#8B2510] relative`}>
        <div className="text-center bg-[#EBB048] p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm mx-4">
          <p className="text-black text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-bokor)' }}>Chat not found</p>
          <button 
            onClick={() => router.push('/chat')}
            className="bg-white text-black font-bold px-6 py-2 rounded-lg border-2 border-black hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN CHAT UI ---
  return (
    <div className={`${boko_font.variable} flex-1 flex flex-col h-full bg-[#8B2510] relative`}>
      
      {/* Texture Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* Chat Header - Neo Brutal Style */}
      <div className="bg-[#8B2510]/95 backdrop-blur-md border-b-2 border-black p-4 flex items-center gap-4 relative z-20 shadow-sm">
        <button
          onClick={() => router.push('/chat')}
          className="bg-white p-2 rounded-lg border-2 border-black hover:bg-[#EBB048] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          title="Back to chats"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div className="relative">
          <img
            src={otherUser.image}
            alt={displayName}
            className="w-12 h-12 rounded-full border-2 border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
          />
          {/* Online/Offline Indicator */}
          <span 
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-black rounded-full transition-colors ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          ></span>
        </div>
        
        <div className="flex-1">
          <h2 className="font-bold text-xl text-white tracking-wide leading-tight" style={{ fontFamily: 'var(--font-bokor)' }}>
            {displayName}
          </h2>
          
          {/* Status Text */}
          {!areFriends ? (
            <p className="text-xs text-[#EBB048] font-bold uppercase tracking-wider bg-black/20 inline-block px-2 py-0.5 rounded-sm">
              No longer friends
            </p>
          ) : isOnline ? (
            <p className="text-xs text-[#EBB048] flex items-center gap-1 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-500 border border-black rounded-full animate-pulse"></span>
              Online
            </p>
          ) : (
            <p className="text-xs text-white/60 font-medium">
              {lastSeen 
                ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
                : 'Offline'
              }
            </p>
          )}
        </div>

        {/* Three Dots Menu - Only show if friends */}
        {areFriends && (
          <div className="bg-white p-2 rounded-lg border-2 border-black hover:bg-[#EBB048] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
            <ChatOptionsMenu
              chatId={chatId}
              currentUserId={currentUserId}
              otherUserId={otherUserId}
              otherUserName={otherUser.name}
            />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        <PrivateMessageList 
          chatId={chatId} 
          currentUserId={currentUserId}
        />
      </div>

      {/* Message Input - Show blocked message if not friends */}
      <div className="relative z-20">
        {areFriends ? (
          <PrivateMessageInput 
            chatId={chatId}
            currentUserId={currentUserId}
            currentUserName={user?.fullName || user?.username || 'Anonymous'}
            currentUserImage={user?.imageUrl || ''}
          />
        ) : (
          <div className="p-6 border-t-2 border-black bg-[#5a1608]">
            <div className="bg-[#EBB048] border-2 border-black rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-black font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-bokor)' }}>
                  Chat Unavailable
                </p>
                <p className="text-sm text-black/80 font-medium">
                  You're no longer friends with {displayName}. Send a friend request to chat again.
                </p>
              </div>
              <button
                onClick={() => router.push('/chat')}
                className="px-5 py-2 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-lg transition font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Back to Chats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}