"use client";
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PrivateMessageInput({ chatId, currentUserId, currentUserName, currentUserImage }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: message.trim(),
        userId: currentUserId,
        userName: currentUserName,
        userImage: currentUserImage,
        timestamp: serverTimestamp(),
      });

      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-gray-700 p-4 bg-gradient-to-r from-gray-800 to-slate-800 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        {/* Emoji Button */}
        <button 
          type="button"
          className="text-gray-400 hover:text-blue-400 transition p-2 hover:bg-gray-700 rounded-full"
          title="Add emoji"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Input Field - Dark Theme */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-full bg-gray-700 border-2 border-gray-600 px-5 py-3 text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
          autoFocus
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          title="Send message"
        >
          {sending ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
