import Sidebar from '@/components/core/sidebar';
import SessionProvider from '@/components/providers/session-provider';
import { auth } from '@/utils/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="mx-auto max-w-screen-2xl">
        <Sidebar user={session?.user} />
        <main className="lg:pl-72">
          <div className="relative">
            <div className="flex flex-col gap-8 p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
