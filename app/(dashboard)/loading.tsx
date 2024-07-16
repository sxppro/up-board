import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const DashboardPageLoading = () => {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)]">
      <Skeleton className="h-9 w-60" />
      <div className="flex-1">
        <div className="h-full flex flex-col items-center justify-center gap-2 m-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
          <h1 className="text-xl tracking-tight">
            Loading account information
          </h1>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageLoading;
