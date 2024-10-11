import PageProgressBar from '@/components/core/page-progress-bar';
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
    <>
      <PageProgressBar />
      <div className="mx-auto max-w-screen-2xl">
        <Sidebar user={user} />
        <main className="lg:pl-72">{children}</main>
      </div>
    </>
  );
}
