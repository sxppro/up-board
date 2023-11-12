import { MainNav } from '@/components/core/MainNav';
import { UserNav } from '@/components/core/UserNav';
import { authOptions } from '@/utils/auth';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
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
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav user={session.user} />
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
