import Sidebar from '@/components/core/sidebar';
import { getCurrentUser } from '@/utils/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar user={user} />
      <main className="lg:pl-72">
        <div className="relative">
          <div className="flex flex-col p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
