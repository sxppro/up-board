import { MainNav } from '@/components/core/MainNav';
import { UserNav } from '@/components/core/UserNav';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Up Dashboard',
  description: 'Smart transaction analysis by Soppro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* className={inter.className} */}
      <body>
        <div className="border-b">
          <div className="flex h-16 items-center px-4 md:px-8">
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
