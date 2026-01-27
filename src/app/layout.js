import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import PresenceInitializer from '@/components/PresenceInitializer';

export const metadata = {
  title: 'Real-Time Chat App',
  description: 'Chat with users in real-time',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className=''>
          <PresenceInitializer />
          {children}
          </body>
      </html>
    </ClerkProvider>
  );
}
