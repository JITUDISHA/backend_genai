"use client";
import { useEffect } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

export function usePresence() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user || !realtimeDb) {
      console.log('Presence: User not signed in or database not initialized');
      return;
    }

    const userId = user.id;
    const userStatusRef = ref(realtimeDb, `/status/${userId}`);
    const connectedRef = ref(realtimeDb, '.info/connected');

    const isOffline = {
      state: 'offline',
      last_changed: serverTimestamp(),
    };

    const isOnline = {
      state: 'online',
      last_changed: serverTimestamp(),
    };

    console.log('Setting up presence for user:', userId);

    // Listen to connection state
    const unsubscribe = onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === false) {
        console.log('Not connected to Firebase');
        return;
      }

      console.log('Connected to Firebase, setting online status');

      try {
        // When connected, set up disconnect handler
        await onDisconnect(userStatusRef).set(isOffline);
        
        // Set online status
        await set(userStatusRef, isOnline);
        
        console.log('Presence set successfully for:', userId);
      } catch (error) {
        console.error('Error setting presence:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up presence for:', userId);
      unsubscribe();
      set(userStatusRef, isOffline).catch(err => console.error('Error setting offline:', err));
    };
  }, [isSignedIn, user]);
}
