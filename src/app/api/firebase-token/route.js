// import { auth } from '@clerk/nextjs/server';
// import { initializeApp, getApps, cert } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';
// import { NextResponse } from 'next/server';

// // Initialize Firebase Admin (only once)
// if (!getApps().length) {
//   initializeApp({
//     credential: cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// export async function POST() {
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Create custom Firebase token for Clerk user
//     const customToken = await getAuth().createCustomToken(userId);

//     return NextResponse.json({ token: customToken });
//   } catch (error) {
//     console.error('Error creating Firebase token:', error);
//     return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
//   }
// }
