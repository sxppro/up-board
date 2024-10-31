'use client';

import { trpc } from '@/utils/trpc';
import { Loader2, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface TransactionPopoverProps extends PropsWithChildren {
  id: string;
}

const TransactionPopover = ({ children, id }: TransactionPopoverProps) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = trpc.public.getTransactionById.useQuery(
    id,
    {
      enabled: open,
    }
  );

  return (
    <Sheet onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Transaction</SheetTitle>
        </SheetHeader>
        {isLoading || isError ? (
          <div className="flex flex-col w-full h-full">
            <div className="flex-1 flex flex-col items-center justify-center gap-2 m-auto">
              {isLoading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-xl tracking-tight">Loading transaction</p>
                </>
              ) : isError ? (
                <>
                  <X className="h-8 w-8" />
                  <p className="text-xl tracking-tight">
                    Unable to load transaction
                  </p>
                </>
              ) : (
                ''
              )}
            </div>
          </div>
        ) : (
          ''
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TransactionPopover;
