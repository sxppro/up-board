import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const AccountPageLoading = () => {
  return (
    <>
      <div className="w-full flex flex-col md:flex-row justify-between gap-2">
        <Skeleton className="h-9 w-60" />
      </div>
      <div className="w-full flex h-screen">
        <div className="flex flex-col items-center gap-2 m-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
          <h1 className="text-xl tracking-tight">
            Loading account information
          </h1>
        </div>
      </div>
    </>
  );
};

export default AccountPageLoading;
