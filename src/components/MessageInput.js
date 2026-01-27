import { useState } from 'react';
import { Bokor } from 'next/font/google';

const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${boko_font.variable} p-4 border-t-2 border-black bg-[#8B2510] relative z-30`}
    >
      <div className="flex gap-3 items-center">
        
        {/* Input Field - Neo Brutal Style */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-5 py-3.5 bg-black/20 border-2 border-black rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-black/40 focus:border-[#EBB048] transition-all shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] font-medium"
        />
        
        {/* Send Button - Matches 'Create free account' style */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-3.5 bg-[#EBB048] text-black font-bold border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
        >
          <span className="uppercase tracking-wider text-sm">Send</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </form>
  );
}