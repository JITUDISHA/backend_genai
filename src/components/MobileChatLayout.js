"use client";
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import ChatSidebar from '@/components/ChatSidebar';
import UserList from '@/components/UserList';
import NotificationBell from '@/components/NotificationBell';

export default function MobileChatLayout({ userId }) {
  const [showUserList, setShowUserList] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Mobile Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-900 to-gray-900 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            {showUserList ? 'Find People' : 'Messages'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell userId={userId} />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 border-2 border-blue-500',
              },
            }}
          />
        </div>
      </header>

      {/* Main Content - Toggle between sidebar and user list */}
      <div className="flex-1 overflow-hidden relative">
        {/* Chat Sidebar - Shows by default */}
        <div className={`absolute inset-0 transition-transform duration-300 ${
          showUserList ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            <ChatSidebar userId={userId} />
            
            {/* New Chat Button - Positioned at bottom */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              <button
                onClick={() => setShowUserList(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>New Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* User List - Slides in when New Chat is clicked */}
        <div className={`absolute inset-0 transition-transform duration-300 ${
          showUserList ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Back Button */}
            <div className="p-3 border-b border-gray-700 bg-gray-800">
              <button
                onClick={() => setShowUserList(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Chats</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <UserList currentUserId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
