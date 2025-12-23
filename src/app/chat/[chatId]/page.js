import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import { UserButton } from '@clerk/nextjs';

export default async function PrivateChatPage({ params }) {
  const { userId } = await auth();
  const { chatId } = await params;
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">Chat App</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <ChatWindow chatId={chatId} currentUserId={userId} />
    </div>
  );
}
