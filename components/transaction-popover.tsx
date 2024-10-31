'use client';

import { TransactionResourceFiltered } from '@/server/schemas';
import { capitalise, cn, formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { TZDate } from '@date-fns/tz';
import { Loader2, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { Separator } from './ui/separator';
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

const PopoverContentCell = ({
  label,
  children,
}: { label: string } & PropsWithChildren) => (
  <div className="flex items-center justify-between overflow-hidden">
    <p className="text-subtle font-semibold truncate">{label}</p>
    {children}
  </div>
);

const PopoverContent = ({ tx }: { tx: TransactionResourceFiltered }) => (
  <div className="flex flex-col mt-6 gap-9">
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 text-xl font-medium">
        <span
          className={cn(
            'flex aspect-square size-12 items-center justify-center rounded-md p-2 font-normal text-white',
            `bg-up-${tx.parentCategory}`
          )}
          aria-hidden="true"
        >
          {tx.description.slice(0, 1).toUpperCase()}
        </span>
        <h2 className="flex-1">{tx.description}</h2>
        <span>{formatCurrency(tx.amountRaw)}</span>
      </div>
      <div className="flex flex-col text-sm gap-2">
        <PopoverContentCell label="Status">
          <p>{capitalise(tx.status)}</p>
        </PopoverContentCell>
        <PopoverContentCell label="Date">
          <p>{new TZDate(tx.time, '+00:00').toLocaleString()}</p>
        </PopoverContentCell>
        <PopoverContentCell label="Transaction Type">
          <p>{tx.transactionType}</p>
        </PopoverContentCell>
        <PopoverContentCell label="Transaction ID">
          <p className="flex-1 text-right">{tx.id}</p>
        </PopoverContentCell>
      </div>
      <Separator />
      <div className="flex flex-col text-sm gap-2">
        <PopoverContentCell label="Message">
          <p>{tx.message || '—'}</p>
        </PopoverContentCell>
        <PopoverContentCell label="Raw Text">
          <p>{tx.rawText || '—'}</p>
        </PopoverContentCell>
      </div>
      <Separator />
      <div className="flex flex-col text-sm gap-2">
        <PopoverContentCell label="Category">
          <p>{tx.parentCategory}</p>
        </PopoverContentCell>
        <PopoverContentCell label="Subcategory">
          <p>{tx.category}</p>
        </PopoverContentCell>
      </div>
    </div>
    <h2 className="text-lg font-medium">Notes</h2>
    <h2 className="text-lg font-medium">Attachments</h2>
  </div>
);

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
          <SheetTitle className="font-medium">Transaction</SheetTitle>
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
        ) : data ? (
          <PopoverContent tx={data} />
        ) : (
          ''
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TransactionPopover;
