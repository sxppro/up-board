import MainNav from '@/components/core/main-nav';
import MobileNav from '@/components/core/mobile-nav';
import PageProgressBar from '@/components/core/page-progress-bar';
import ThemeToggle from '@/components/core/theme-toggle';
import UserNav from '@/components/core/user-nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getCurrentUser } from '@/utils/auth';
import { Flex } from '@tremor/react';
import { FlaskConical } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

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
      <div className="border-b">
        <div className="max-w-screen-2xl m-auto flex h-16 items-center px-4 md:px-8">
          <MainNav className="hidden sm:flex items-center space-x-4 lg:space-x-6" />
          <MobileNav className="sm:hidden" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <UserNav user={user} />
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FlaskConical className="mr-2 h-4 w-4" /> Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Demo Mode</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    You are currently in demo mode. Mock data will be used.
                  </DialogDescription>
                  <DialogFooter>
                    <Button asChild>
                      <Link href={'/login'}>Log in</Link>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      <main className="max-w-screen-2xl m-auto py-4 px-4 md:px-8">
        <Flex className="gap-2" flexDirection="col" alignItems="start">
          {children}
        </Flex>
      </main>
    </>
  );
}
