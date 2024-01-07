import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';
import { HTMLAttributes } from 'react';

/**
 * Loader/spinner
 * @requires flex parent
 * @returns
 */
const Loader = ({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('flex flex-1 items-center justify-center', className)}>
      <Loader2 className="animate-spin h-8 w-8" />
    </div>
  );
};

export default Loader;
