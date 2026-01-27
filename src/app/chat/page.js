import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import UserList from '@/components/UserList';
import ChatSidebar from '@/components/ChatSidebar';
import PresenceInitializer from '@/components/PresenceInitializer';
import NotificationBell from '@/components/NotificationBell';
import MobileChatLayout from '@/components/MobileChatLayout';
import { Bokor } from 'next/font/google';

// Import the aesthetic font
const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default async function ChatPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <>
      <PresenceInitializer />
      
      {/* GLOBAL THEME WRAPPER 
        - Applied Rust Background
        - Applied Font Variable
      */}
      <div className={`${boko_font.variable} h-screen w-full bg-[#8B2510] relative flex flex-col overflow-hidden text-white selection:bg-[#EBB048] selection:text-[#8B2510]`}>
        
        {/* --- BACKGROUND TEXTURES (Shared across Desktop/Mobile) --- */}
        {/* 1. Base Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#9e3a22] via-[#8B2510] to-[#5a1608] z-0 pointer-events-none" />

        {/* 2. Noise Texture */}
        <div className="absolute inset-0 opacity-[0.05] z-[1] pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* 3. Dotted Grid Mask */}
        <div className="absolute inset-0 z-[2] opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />


        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden md:flex h-full flex-col relative z-10">
          
          {/* Header - PostPilot / Neo-Brutalism Style */}
          <header className="border-b-2 border-black/10 px-6 py-3 flex items-center justify-between bg-[#8B2510]/90 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Logo Icon - Gold Box with Hard Black Border */}
                <div className="w-10 h-10 bg-[#EBB048] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl pt-1 leading-none text-white drop-shadow-md" style={{ fontFamily: 'var(--font-bokor)' }}>
                    C.dOT
                  </h1>
                  <p className="text-xs text-[#EBB048]/80 font-medium tracking-wide">
                    SECURE CHANNELS
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell Wrapper */}
              <div className="p-2 hover:bg-black/10 rounded-full transition-colors">
                 <NotificationBell userId={userId} />
              </div>
              
              <div className="h-6 w-[2px] bg-white/20 mx-1"></div>

              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider text-[#EBB048]">
                  Online
                </span>
                {/* User Button - Styled to match Gold Theme */}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 border-2 border-[#EBB048] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]',
                      userButtonPopoverCard: 'bg-[#8B2510] border-2 border-black font-sans',
                      userButtonPopoverActionButton: 'hover:bg-[#EBB048] hover:text-black',
                      userButtonPopoverActionButtonText: 'text-white',
                      userButtonPopoverFooter: 'hidden'
                    },
                  }}
                />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar - Darker Overlay + Right Border */}
            <div className="w-80 border-r-2 border-black/10 bg-black/10 backdrop-blur-sm">
              <ChatSidebar userId={userId} />
            </div>

            {/* User List / Chat Area - Transparent to let texture show */}
            <div className="flex-1 overflow-y-auto relative">
              <UserList currentUserId={userId} />
            </div>
          </div>
        </div>

        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden h-screen relative z-10">
          <MobileChatLayout userId={userId} />
        </div>
        
      </div>
    </>
  );
}