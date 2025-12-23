"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ChatSidebar({ userId }) {
  const [chats, setChats] = useState([]);
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-[#a3cdba]">
        <h2 className="text-lg font-semibold">Recent Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-950 ">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Select a user to start chatting</p>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              return (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="p-4 hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 bg-amber-200 rounded-md p-1">
                    <img
                      src={otherUser.image}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0 rounded-md p-0.5 bg-[#d8c6d8] px-5 ">
                      <p className="font-semibold truncate">{otherUser.name}</p>
                      {chat.lastMessage && (
                        <>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400">
                            {chat.lastMessageTime && 
                              formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
