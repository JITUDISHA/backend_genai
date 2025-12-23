import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users from Clerk
    const client = await clerkClient();
    const users = await client.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    // Filter out current user and format response
    const filteredUsers = users.data
      .filter(user => user.id !== userId)
      .map(user => ({
        id: user.id,
        username: user.username || user.firstName || 'Anonymous',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User',
        imageUrl: user.imageUrl,
        emailAddress: user.emailAddresses[0]?.emailAddress || '',
        createdAt: user.createdAt,
      }));

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
