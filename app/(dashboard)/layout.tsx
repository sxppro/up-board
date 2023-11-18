import { MainNav } from '@/components/core/MainNav';
import ThemeToggle from '@/components/core/ThemeToggle';
import { UserNav } from '@/components/core/UserNav';
import { getCurrentUser } from '@/utils/session';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Up Dashboard',
  description: 'Smart transaction analysis by Soppro',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
