'use client';

import { TransactionResourceFiltered } from '@/server/schemas';
import { capitalise, cn, formatCurrency } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { trpc } from '@/utils/trpc';
import { TZDate } from '@date-fns/tz';
import { ArrowSquareOut, CircleNotch, X } from '@phosphor-icons/react';
import Link from 'next/link';
import { CSSProperties, PropsWithChildren, useState } from 'react';
import { Button } from './ui/button';
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
  <div className="flex items-center justify-between gap-2">
    <p className="text-subtle font-semibold">{label}</p>
    {children}
  </div>
);

const PopoverContent = ({ tx }: { tx: TransactionResourceFiltered }) => {
  const { refetch } = trpc.user.getAttachment.useQuery(tx.attachment || '', {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  return (
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
          <h2 className="flex-1">
            {tx.isCategorizable ? (
              <Button
                variant="link"
                className={cn('p-0 text-xl', focusRing)}
                asChild
              >
                <Link href={`/merchant/${encodeURIComponent(tx.description)}`}>
                  {tx.description}
                </Link>
              </Button>
            ) : (
              tx.description
            )}
          </h2>
          <span>{formatCurrency(tx.amountRaw)}</span>
        </div>
        <div className="flex flex-col text-sm gap-2">
          <PopoverContentCell label="Status">
            <p>{capitalise(tx.status)}</p>
          </PopoverContentCell>
          <PopoverContentCell label="Date">
            <p>{new TZDate(tx.time).toLocaleString()}</p>
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
            <p className="text-right">{tx.message || '—'}</p>
          </PopoverContentCell>
          <PopoverContentCell label="Raw Text">
            <p>{tx.rawText || '—'}</p>
          </PopoverContentCell>
        </div>
        {tx.isCategorizable && (
          <>
            <Separator />
            <div className="flex flex-col text-sm gap-2">
              <PopoverContentCell label="Category">
                <p>{tx.parentCategoryName}</p>
              </PopoverContentCell>
              <PopoverContentCell label="Subcategory">
                <p>{tx.categoryName}</p>
              </PopoverContentCell>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Notes</h2>
        {tx.note ? (
          <p className="text-subtle text-sm">{tx.note}</p>
        ) : (
          <p className="text-muted-foreground text-sm">No note.</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Attachments</h2>
        {tx.attachment ? (
          <Button
            variant="link"
            className="border"
            onClick={(e) => {
              e.preventDefault();
              refetch().then((data) =>
                window.open(data.data?.attributes.fileURL || '', '_blank')
              );
            }}
          >
            View attachment
            <ArrowSquareOut className="size-4" />
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm">No attachment.</p>
        )}
      </div>
      {tx.deepLinkURL && (
        <div
          className="flex self-center items-center gap-x-1 rounded-full bg-gray-950 p-1 text-sm shadow-xl shadow-black/20 ring-1 ring-white/10 transition border border-transparent [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
          style={
            {
              '--background': '30 41 59',
              '--highlight': '210 40% 98%',

              '--bg-color':
                'linear-gradient(rgb(var(--background)), rgb(var(--background)))',
              '--border-color': `linear-gradient(145deg,
            rgb(var(--highlight)) 0%,
            rgb(var(--highlight) / 0.3) 33.33%,
            rgb(var(--highlight) / 0.14) 66.67%,
            rgb(var(--highlight) / 0.1) 100%)
          `,
            } as CSSProperties
          }
        >
          <Button
            className={cn(
              'rounded-full bg-gradient-to-b from-white to-gray-200 font-semibold text-primary dark:text-primary-foreground',
              focusRing
            )}
            asChild
          >
            <Link href={tx.deepLinkURL}>Open in Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

const TransactionPopover = ({ children, id }: TransactionPopoverProps) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = trpc.public.getTransactionById.useQuery(
    id,
    {
      refetchOnWindowFocus: false,
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
                  <CircleNotch className="size-8 animate-spin" />
                  <p className="text-xl tracking-tight">Loading transaction</p>
                </>
              ) : isError ? (
                <>
                  <X className="size-8" />
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
