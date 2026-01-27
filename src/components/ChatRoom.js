"use client";
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Bokor } from 'next/font/google';

// Font Configuration
const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

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
    <div className={`${boko_font.variable} min-h-screen w-full bg-[#8B2510] relative flex flex-col overflow-hidden`}>
      
      {/* --- BACKGROUND LAYERS (VISIBLE DOTS) --- */}
      {/* 1. Base Gradient for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#9e3a22] via-[#8B2510] to-[#5a1608] z-0 pointer-events-none" />
      
      {/* 2. Dotted Grid Texture - Visible background */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* 3. Noise Texture for that "Paper" feel */}
      <div className="absolute inset-0 opacity-[0.05] z-0 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* --- CHAT CONTENT CONTAINER --- */}
      <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto w-full shadow-2xl">
        
        {/* Optional: Chat Header for the Room */}
        <header className="p-4 border-b-2 border-black bg-[#EBB048] flex items-center justify-between shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-lg border-2 border-black">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EBB048]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black pt-1" style={{ fontFamily: 'var(--font-bokor)' }}>
              Public Lounge
            </h2>
          </div>
          <div className="text-xs font-black uppercase tracking-tighter bg-black text-white px-2 py-1 rounded">
            Live
          </div>
        </header>

        {/* Message List Area - Transparent to see background dots */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList messages={messages} currentUserId={user?.id} />
        </div>

        {/* Message Input Area */}
        <div className="bg-[#8B2510]/80 backdrop-blur-md relative z-20">
          <MessageInput onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}