"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { generateChatId, getOrCreateChat } from '@/lib/chatUtils';
import { 
  sendFriendRequest, 
  getFriendshipStatus, 
  checkIfFriends,
  getUserFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests
} from '@/lib/friendUtils';
import { Bokor } from 'next/font/google';

// Font Configuration
const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default function UserList({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendshipStatuses, setFriendshipStatuses] = useState({});
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
      await updateFriendshipStatuses(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFriendshipStatuses = async (usersList = users) => {
    const statuses = {};
    for (const u of usersList) {
      statuses[u.id] = await getFriendshipStatus(currentUserId, u.id);
    }
    setFriendshipStatuses(statuses);
  };

  const fetchFriends = async () => {
    try {
      const friendsList = await getUserFriends(currentUserId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      updateFriendshipStatuses(),
      fetchFriends()
    ]);
  };

  const handleSendRequest = async (otherUser) => {
    setLoadingStates(prev => ({ ...prev, [otherUser.id]: true }));
    try {
      await sendFriendRequest(
        currentUserId,
        otherUser.id,
        { name: user.fullName || user.username, image: user.imageUrl },
        { name: otherUser.fullName, image: otherUser.imageUrl }
      );
      setFriendshipStatuses(prev => ({ ...prev, [otherUser.id]: 'request_sent' }));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [otherUser.id]: false }));
    }
  };

  const handleViewRequest = async (otherUser) => {
    const pendingRequests = await getPendingRequests(currentUserId);
    const request = pendingRequests.find(req => req.from === otherUser.id);
    if (request) {
      setSelectedRequest({ ...request, userInfo: otherUser });
      setShowRequestModal(true);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    try {
      await acceptFriendRequest(selectedRequest.id, currentUserId);
      setShowRequestModal(false);
      setSelectedRequest(null);
      setFriendshipStatuses(prev => ({ ...prev, [selectedRequest.from]: 'friends' }));
      refreshData();
    } catch (error) {
      alert('Failed to accept: ' + error.message);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    try {
      await rejectFriendRequest(selectedRequest.id);
      setShowRequestModal(false);
      setSelectedRequest(null);
      setFriendshipStatuses(prev => ({ ...prev, [selectedRequest.from]: 'not_friends' }));
      refreshData();
    } catch (error) {
      alert('Failed to reject: ' + error.message);
    }
  };

  const handleStartChat = async (otherUser) => {
    const areFriends = await checkIfFriends(currentUserId, otherUser.id);
    if (!areFriends) {
      alert('You can only chat with friends.');
      return;
    }
    try {
      const chatId = await getOrCreateChat(
        currentUserId,
        otherUser.id,
        { name: user.fullName || user.username, image: user.imageUrl },
        { name: otherUser.fullName, image: otherUser.imageUrl }
      );
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleViewProfile = (otherUser) => {
    setSelectedProfile(otherUser);
    setShowProfileModal(true);
    setOpenMenuId(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (showOnlyFriends) return matchesSearch && friendshipStatuses[u.id] === 'friends';
    return matchesSearch;
  });

  // --- NEO-BRUTAL BUTTON COMPONENT ---
  const renderActionButton = (otherUser) => {
    const status = friendshipStatuses[otherUser.id];
    const isLoading = loadingStates[otherUser.id];
    const baseClass = "w-full py-2.5 px-4 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2";

    if (status === 'friends') {
      return (
        <button onClick={() => handleStartChat(otherUser)} className={`${baseClass} bg-[#EBB048] text-black`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
          Chat
        </button>
      );
    }
    if (status === 'request_sent') {
      return (
        <button disabled className="w-full py-2.5 px-4 rounded-lg font-bold border-2 border-black/50 bg-black/20 text-white/50 cursor-not-allowed flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pending
        </button>
      );
    }
    if (status === 'request_received') {
      return (
        <button onClick={() => handleViewRequest(otherUser)} className={`${baseClass} bg-green-500 text-black`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Respond
        </button>
      );
    }
    return (
      <button onClick={() => handleSendRequest(otherUser)} disabled={isLoading} className={`${baseClass} bg-white text-black`}>
        {isLoading ? "Wait..." : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Connect
          </>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className={`${boko_font.variable} h-full flex items-center justify-center bg-[#8B2510] relative overflow-hidden`}>
         {/* Texture Background for Loading State */}
         <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]" />
         <div className="z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#EBB048] mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"></div>
          <p className="text-white font-medium" style={{ fontFamily: 'var(--font-bokor)' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${boko_font.variable} h-full flex flex-col bg-[#8B2510] relative overflow-hidden`}>
      
      {/* --- BACKGROUND LAYERS (VISIBLE DOTS) --- */}
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#9e3a22] via-[#8B2510] to-[#5a1608] z-0 pointer-events-none" />
      
      {/* 2. Dotted Grid (High contrast for visibility) */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* 3. Noise Texture */}
      <div className="absolute inset-0 opacity-[0.05] z-0 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />


      {/* --- SEARCH HEADER --- */}
      <div className="p-6 border-b-2 border-black bg-[#8B2510]/80 backdrop-blur-md z-20 relative">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-black/30 border-2 border-black rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-black/50 focus:border-[#EBB048] transition-all shadow-inner"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowOnlyFriends(false)} className={`flex-1 py-2 px-4 rounded-lg font-bold border-2 border-black transition-all ${!showOnlyFriends ? 'bg-[#EBB048] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent text-white/70 hover:bg-white/10 shadow-none'}`}>
            All Users
          </button>
          <button onClick={() => setShowOnlyFriends(true)} className={`flex-1 py-2 px-4 rounded-lg font-bold border-2 border-black transition-all ${showOnlyFriends ? 'bg-[#EBB048] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent text-white/70 hover:bg-white/10 shadow-none'}`}>
            Friends
          </button>
        </div>
      </div>

      {/* --- USERS GRID --- */}
      <div className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-bokor)' }}>
            {showOnlyFriends ? 'Your Friends' : 'Discover People'}
          </h2>
          <span className="bg-black text-[#EBB048] border border-[#EBB048] text-sm font-bold px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(235,176,72,0.3)]">
            {filteredUsers.length} Found
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center mt-16 p-8 bg-black/20 border-2 border-black rounded-xl backdrop-blur-sm">
            <div className="w-20 h-20 bg-black/40 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-white/60 font-medium">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((otherUser) => (
              <div key={otherUser.id} className="group relative">
                {/* CARD STYLE: 
                   - bg-black/20:  Semi-transparent black to let dots show through
                   - backdrop-blur-sm: Slight blur to make text readable
                   - border-2 border-black: Hard border
                   - shadow-[...]: Hard shadow
                */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col">
                  
                  {/* Three Dots Menu */}
                  <div className="absolute top-3 right-3 z-30">
                      <button onClick={() => setOpenMenuId(openMenuId === otherUser.id ? null : otherUser.id)} className="p-1.5 hover:bg-[#EBB048] hover:text-black text-white/60 rounded border border-transparent hover:border-black transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      </button>
                      {openMenuId === otherUser.id && (
                        <>
                          <div className="fixed inset-0" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-[#8B2510] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg z-40 overflow-hidden">
                            <button onClick={() => handleViewProfile(otherUser)} className="w-full px-4 py-3 text-left hover:bg-[#EBB048] hover:text-black transition flex items-center gap-3 text-white font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              <span>View Profile</span>
                            </button>
                          </div>
                        </>
                      )}
                  </div>

                  <div className="flex flex-col items-center text-center mt-2 flex-grow">
                    <div className="relative mb-4">
                      <img src={otherUser.imageUrl} alt={otherUser.fullName} className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-sm bg-gray-800" />
                      {friendshipStatuses[otherUser.id] === 'friends' && (
                        <span className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-lg mb-0.5 truncate w-full" style={{ fontFamily: 'var(--font-bokor)' }}>
                      {otherUser.fullName}
                    </h3>
                    <p className="text-sm text-[#EBB048] mb-6 truncate w-full font-medium tracking-wide">
                      @{otherUser.username}
                    </p>
                  </div>
                  
                  {/* Action Button pinned to bottom */}
                  <div className="mt-auto">
                    {renderActionButton(otherUser)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#8B2510] rounded-xl w-full max-w-md border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
            <div className="h-24 bg-[#EBB048] border-b-2 border-black relative">
                 <button onClick={() => setShowProfileModal(false)} className="absolute top-3 right-3 p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white rounded transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
            </div>
            <div className="px-6 pb-6 text-center -mt-12">
               <div className="inline-block relative">
                 <img src={selectedProfile.imageUrl} alt={selectedProfile.fullName} className="w-28 h-28 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] object-cover bg-white" />
               </div>
               <div className="mt-4">
                  <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-bokor)' }}>{selectedProfile.fullName}</h2>
                  <p className="text-[#EBB048] font-medium">@{selectedProfile.username}</p>
                  <p className="text-sm text-white/60 mb-6">{selectedProfile.email}</p>
                  <div className="mb-6">
                    {friendshipStatuses[selectedProfile.id] === 'friends' ? (
                       <span className="px-3 py-1 bg-green-500 border-2 border-black text-black font-bold text-xs uppercase rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Friends</span>
                    ) : (
                       <span className="px-3 py-1 bg-gray-200 border-2 border-black text-black font-bold text-xs uppercase rounded-md">Not Connected</span>
                    )}
                  </div>
                  {renderActionButton(selectedProfile)}
               </div>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#8B2510] rounded-xl w-full max-w-sm border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'var(--font-bokor)' }}>Friend Request</h3>
            <div className="flex flex-col items-center gap-3 mb-6">
              <img src={selectedRequest.userInfo.imageUrl} alt={selectedRequest.fromUserData.name} className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-md" />
              <div className="text-center">
                <p className="text-lg font-bold text-[#EBB048]">{selectedRequest.fromUserData.name}</p>
                <p className="text-sm text-white/70">@{selectedRequest.userInfo.username}</p>
              </div>
            </div>
            <p className="text-white mb-6 text-center text-sm">wants to start a conversation with you.</p>
            <div className="flex gap-3 mb-3">
              <button onClick={handleRejectRequest} className="flex-1 py-3 bg-white text-black font-bold border-2 border-black rounded-lg hover:bg-gray-200 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">Decline</button>
              <button onClick={handleAcceptRequest} className="flex-1 py-3 bg-[#EBB048] text-black font-bold border-2 border-black rounded-lg hover:bg-[#d89f3d] transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">Accept</button>
            </div>
            <button onClick={() => setShowRequestModal(false)} className="w-full text-white/50 hover:text-white text-xs uppercase font-bold tracking-wider mt-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}