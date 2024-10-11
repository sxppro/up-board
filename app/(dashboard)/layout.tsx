import PageProgressBar from '@/components/core/page-progress-bar';
import { Sidebar } from '@/components/core/sidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageProgressBar />
      <div className="mx-auto max-w-screen-2xl">
        <Sidebar />
        <main className="lg:pl-72">{children}</main>
      </div>
    </>
  );
}
