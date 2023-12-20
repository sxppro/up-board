import { getCurrentUser } from '@/utils/auth';
import { X } from 'lucide-react';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

const LoginErrorPage: NextPage = async () => {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col items-center gap-2 m-auto">
        <X className="h-8 w-8" />
        <h1 className="text-xl tracking-tight">Unable to sign in</h1>
      </div>
    </div>
  );
};

export default LoginErrorPage;
