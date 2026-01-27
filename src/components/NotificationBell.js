"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/friendUtils';
import { formatDistanceToNow } from 'date-fns';
import { Bokor } from 'next/font/google';

const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleToggleDropdown = async () => {
    const newState = !showDropdown;
    setShowDropdown(newState);

    if (newState && unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter(n => !n.read);

      unreadNotifs.forEach((notif) => {
        const notifRef = doc(db, 'notifications', notif.id);
        batch.update(notifRef, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleAccept = async (requestId, notificationId) => {
    try {
      await acceptFriendRequest(requestId, userId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (requestId, notificationId) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={`${boko_font.variable} relative`}>
      {/* Bell Icon - Neo Brutal Style */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2.5 bg-[#EBB048] border-2 border-black rounded-full hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge - Square Black Style */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold border border-white flex items-center justify-center animate-bounce shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - High Z-Index */}
      {showDropdown && (
        <>
          <div 
            className=" relative inset-0 z-[100]" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="relative z-50 right-0 mt-3 w-96 bg-[#8B2510] border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[70] max-h-[500px] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-[#EBB048]">
              <h3 className="text-xl font-bold text-black flex items-center gap-2" style={{ fontFamily: 'var(--font-bokor)' }}>
                Notifications
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-sans">
                   {notifications.length}
                </span>
              </h3>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-[#8B2510]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/20 border-2 border-black rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-white/60 font-medium">All caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-black/20 hover:bg-black/10 transition ${!notif.read ? 'bg-white/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={notif.fromUserImage}
                        alt={notif.fromUserName}
                        className="w-12 h-12 rounded-full border-2 border-black object-cover bg-white"
                      />
                      
                      <div className="flex-1 min-w-0">
                        {notif.type === 'friend_request' && (
                          <>
                            <p className="text-white text-sm leading-snug">
                              <span className="font-bold text-[#EBB048]">{notif.fromUserName}</span> sent you a friend request.
                            </p>
                            <p className="text-xs text-white/50 mt-1 font-medium">
                              {notif.createdAt && formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                            </p>
                            
                            {/* Actions */}
                            {!notif.read && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleAccept(notif.requestId, notif.id)}
                                  className="px-3 py-1.5 bg-[#EBB048] text-black text-xs font-bold border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(notif.requestId, notif.id)}
                                  className="px-3 py-1.5 bg-white text-black text-xs font-bold border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {notif.type === 'friend_accepted' && (
                          <>
                            <p className="text-white text-sm leading-snug">
                              <span className="font-bold text-[#EBB048]">{notif.fromUserName}</span> accepted your friend request.
                            </p>
                            <p className="text-xs text-white/50 mt-1 font-medium">
                              {notif.createdAt && formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}