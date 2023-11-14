import { Loader2 } from 'lucide-react';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

const LoginRedirectPage: NextPage = () => {
  redirect('/');

  return (
    <div className="flex h-screen">
      <div className="flex flex-col items-center gap-2 m-auto">
        <Loader2 className="h-8 w-8 animate-spin" />
        <h1 className="text-xl tracking-tight">Redirecting</h1>
      </div>
    </div>
  );
};

export default LoginRedirectPage;
