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
    <div className="h-screen flex flex-col bg-[#020617] text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-950 via-slate-900 to-[#020617]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 text-white"
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

          <h1 className="text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
            Chat App
          </h1>
        </div>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox:
                'w-9 h-9 sm:w-10 sm:h-10 ring-2 ring-cyan-500/60 hover:ring-cyan-400 transition',
            },
          }}
        />
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="
          hidden md:flex
          w-72 lg:w-80
          flex-col
          border-r border-white/10
          bg-[#020617]/90
          backdrop-blur
        ">
          <ChatSidebar userId={userId} />
        </aside>

        {/* Content */}
        <main className="
          flex-1
          overflow-y-auto
          bg-gradient-to-br
          from-[#020617]
          via-slate-900/60
          to-[#020617]
        ">
          <UserList currentUserId={userId} />
        </main>
      </div>
    </div>
  );
}
