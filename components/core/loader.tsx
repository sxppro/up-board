import { Loader2 } from 'lucide-react';

/**
 * Loader/spinner
 * @requires flex parent
 * @returns
 */
const Loader = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8" />
    </div>
  );
};

export default Loader;
