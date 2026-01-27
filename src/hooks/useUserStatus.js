"use client";
import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';

export function useUserStatus(userId) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !realtimeDb) {
      console.log('useUserStatus: No userId or database');
      setLoading(false);
      return;
    }

    console.log('useUserStatus: Watching status for:', userId);

    const userStatusRef = ref(realtimeDb, `/status/${userId}`);

    const handleStatusChange = (snapshot) => {
      const data = snapshot.val();
      console.log('Status update for', userId, ':', data);
      
      if (data) {
        const online = data.state === 'online';
        setIsOnline(online);
        setLastSeen(data.last_changed);
        console.log('User', userId, 'is', online ? 'ONLINE' : 'OFFLINE');
      } else {
        setIsOnline(false);
        setLastSeen(null);
        console.log('No status data for user:', userId);
      }
      setLoading(false);
    };

    // Listen to status changes
    onValue(userStatusRef, handleStatusChange, (error) => {
      console.error('Error listening to status:', error);
      setLoading(false);
    });

    return () => {
      console.log('useUserStatus: Cleaning up for:', userId);
      off(userStatusRef, 'value', handleStatusChange);
    };
  }, [userId]);

  return { isOnline, lastSeen, loading };
}
