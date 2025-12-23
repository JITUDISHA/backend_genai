"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { generateChatId, getOrCreateChat } from '@/lib/chatUtils';

export default function UserList({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (otherUser) => {
    try {
      const chatId = await getOrCreateChat(
        currentUserId,
        otherUser.id,
        {
          name: user.fullName || user.username,
          image: user.imageUrl,
        },
        {
          name: otherUser.fullName,
          image: otherUser.imageUrl,
        }
      );

      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b bg-white sticky top-0">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          All Users ({filteredUsers.length})
        </h2>

        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">No users found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartChat(user)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Start Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
