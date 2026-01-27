"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeFriend, setFriendNickname, clearChat } from '@/lib/friendUtils';
import { Bokor } from 'next/font/google';

const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function ChatOptionsMenu({ 
  chatId, 
  currentUserId, 
  otherUserId, 
  otherUserName 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await clearChat(chatId);
      alert('Chat cleared successfully!');
      setShowMenu(false);
    } catch (error) {
      alert('Failed to clear chat: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNickname = async () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }

    setLoading(true);
    try {
      await setFriendNickname(currentUserId, otherUserId, nickname.trim());
      alert('Nickname set successfully!');
      setShowNicknameModal(false);
      setShowMenu(false);
      setNickname('');
    } catch (error) {
      alert('Failed to set nickname: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm(`Are you sure you want to remove ${otherUserName} as a friend? You will no longer be able to chat.`)) {
      return;
    }

    setLoading(true);
    try {
      await removeFriend(currentUserId, otherUserId);
      alert('Friend removed successfully!');
      router.push('/chat');
    } catch (error) {
      alert('Failed to remove friend: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={boko_font.variable}>
      {/* Three Dots Button - Gold Round Style */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-[#EBB048] border-2 border-black rounded-full hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px]"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Dropdown Menu - Neo Brutal Card */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-[80]" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-3 w-56 bg-[#8B2510] border-2 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-[90] overflow-hidden">
              <button
                onClick={() => {
                  setShowNicknameModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#EBB048] hover:text-black transition-colors flex items-center gap-3 text-white font-bold border-b border-black/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Nickname</span>
              </button>

              <button
                onClick={handleClearChat}
                disabled={loading}
                className="w-full px-4 py-3 text-left hover:bg-[#EBB048] hover:text-black transition-colors flex items-center gap-3 text-white font-bold border-b border-black/20 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Chat</span>
              </button>

              <button
                onClick={handleRemoveFriend}
                disabled={loading}
                className="w-full px-4 py-3 text-left hover:bg-white hover:text-red-600 transition-colors flex items-center gap-3 text-red-400 font-bold disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                </svg>
                <span>Unfriend</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Nickname Modal - PostPilot Card Style */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#8B2510] rounded-xl p-8 w-full max-w-md border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Texture background for modal */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-2 leading-none" style={{ fontFamily: 'var(--font-bokor)' }}>
                Set Nickname
              </h3>
              <p className="text-sm text-[#EBB048] font-bold uppercase tracking-wider mb-6">
                Custom name for {otherUserName}
              </p>
              
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname..."
                maxLength={30}
                className="w-full px-4 py-3 bg-black/30 border-2 border-black rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#EBB048] transition-all mb-8 shadow-inner"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSetNickname();
                }}
              />

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowNicknameModal(false);
                    setNickname('');
                  }}
                  className="px-6 py-2 bg-white text-black font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetNickname}
                  disabled={loading || !nickname.trim()}
                  className="px-8 py-2 bg-[#EBB048] text-black font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}