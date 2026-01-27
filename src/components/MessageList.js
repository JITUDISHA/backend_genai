import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bokor } from 'next/font/google';

const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`${boko_font.variable} flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10`}>
      {messages.map((message) => {
        const isOwnMessage = message.userId === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar with Hard Border */}
              <img
                src={message.userImage}
                alt={message.userName}
                className="w-10 h-10 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white self-end"
              />
              
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble - Neo Brutal Card Style */}
                <div className={`rounded-xl p-4 border-2 border-black transition-transform hover:scale-[1.01] ${
                  isOwnMessage 
                    ? 'bg-[#EBB048] text-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}>
                  <p className="text-[10px] uppercase font-black tracking-tighter mb-1 opacity-70" style={{ fontFamily: 'var(--font-bokor)' }}>
                    {message.userName}
                  </p>
                  <p className="text-sm md:text-base font-medium leading-relaxed">
                    {message.text}
                  </p>
                </div>

                {/* Timestamp */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-2 px-1">
                  {message.timestamp && formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}