import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import UserList from '@/components/UserList';
import ChatSidebar from '@/components/ChatSidebar';

export default async function ChatPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex flex-col ">
      {/* Header - Dark Gradient */}
      <header className="border-b border-gray-700 p-4 flex justify-between items-center bg-gradient-to-r from-slate-800 to-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Chat App
          </h1>
        </div>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 border-2 border-blue-500"
            }
          }}
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with recent chats */}
        <div className="w-80 border-r border-gray-700 bg-gradient-to-b from-gray-800 to-slate-800">
          <ChatSidebar userId={userId} />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
          <UserList currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
