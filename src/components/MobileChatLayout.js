"use client";
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import ChatSidebar from '@/components/ChatSidebar';
import UserList from '@/components/UserList';
import NotificationBell from '@/components/NotificationBell';

export default function MobileChatLayout({ userId }) {
  const [showUserList, setShowUserList] = useState(false);

  return (
    /* Change 1: Replaced bg-gray-900 with your theme's Rust background */
    <div className="h-screen flex flex-col bg-[#8B2510] text-white">
      
      {/* Mobile Header: Brutalist Style */}
      <header className="relative z-50 border-b-2 border-black px-4 py-3 flex items-center justify-between bg-[#8B2510] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          {/* Logo with Neo-Brutalist Frame */}
          <div className="w-9 h-9 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0_0_#000]">
            <Image 
              src="/favicon.ico" 
              alt="Logo" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            {showUserList ? (
              <span className="text-[#EBB048]">Find Pilots</span>
            ) : (
              <span>Messages</span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell userId={userId} />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                /* Hard shadow for the user avatar */
                avatarBox: 'w-9 h-9 border-2 border-black shadow-[3px_3px_0_0_#000]',
              },
            }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* Chat Sidebar View */}
        <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          showUserList ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ChatSidebar userId={userId} />
            </div>
            
            {/* New Chat Button: Brutalist Gold Style */}
            <div className="p-4 border-t-2 border-black bg-[#5a1608]">
              <button
                onClick={() => setShowUserList(true)}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#EBB048] text-black font-black border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase italic tracking-tight"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Initiate Flight</span>
              </button>
            </div>
          </div>
        </div>

        {/* User List View */}
        <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          showUserList ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col bg-[#8B2510]">
            {/* Back Button Strip */}
            <div className="p-3 border-b-2 border-black bg-[#5a1608]">
              <button
                onClick={() => setShowUserList(false)}
                className="flex items-center gap-2 text-[#EBB048] font-black uppercase text-xs tracking-widest hover:translate-x-[-2px] transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Return to Hangar area </span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <UserList currentUserId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
