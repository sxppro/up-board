import { siteConfig } from '@/app/siteConfig';
import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { Metadata, NextPage } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Redirecting ...`,
};

const LoginRedirectPage: NextPage = () => {
  redirect('/');

  return (
    <div className="flex h-screen">
      <div className="flex flex-col items-center gap-2 m-auto">
        <CircleNotch className="h-8 w-8 animate-spin" />
        <h1 className="text-xl tracking-tight">Redirecting</h1>
      </div>
    </div>
  );
};

export default LoginRedirectPage;
