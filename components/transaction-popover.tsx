'use client';

import { TransactionResourceFiltered } from '@/server/schemas';
import { CachePresets } from '@/utils/constants';
import { capitalise, cn, formatCurrency } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { trpc } from '@/utils/trpc';
import { TZDate } from '@date-fns/tz';
import { CircleNotch, ClipboardText, X } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CSSProperties,
  MouseEventHandler,
  PropsWithChildren,
  useState,
} from 'react';
import TransactionTagsCombobox from './core/transaction-tags-combobox';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { useToast } from './ui/use-toast';

interface TransactionPopoverProps extends PropsWithChildren {
  id: string;
}

const PopoverContentCell = ({
  label,
  className,
  children,
  onClick,
}: {
  label: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
} & PropsWithChildren) => (
  <div
    className={cn('flex items-center justify-between gap-2', className)}
    onClick={onClick}
  >
    <p className="text-subtle font-semibold">{label}</p>
    {children}
  </div>
);

const PopoverContent = ({ tx }: { tx: TransactionResourceFiltered }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const { data: attachment, isLoading } = trpc.user.getAttachment.useQuery(
    tx.attachment || '',
    {
      refetchOnWindowFocus: false,
      enabled: isDialogOpen,
    }
  );
  const { data: tags } = trpc.user.getTags.useQuery(undefined, {
    enabled: !!session,
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
                className={cn('p-0 text-xl text-wrap', focusRing)}
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
          <PopoverContentCell
            label="Transaction ID"
            className="cursor-pointer transition hover:text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(tx.id);
              toast({
                description: (
                  <div className="flex gap-2 items-center">
                    <ClipboardText className="h-5 w-5" />
                    <span>Transaction ID copied</span>
                  </div>
                ),
              });
            }}
          >
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
                <Link
                  href={`/spending?category=${encodeURIComponent(
                    tx.parentCategory
                  )}`}
                  className="underline"
                >
                  {tx.parentCategoryName}
                </Link>
              </PopoverContentCell>
              <PopoverContentCell label="Subcategory">
                <Link
                  href={`/spending/${encodeURIComponent(tx.category)}`}
                  className="underline"
                >
                  {tx.categoryName}
                </Link>
              </PopoverContentCell>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-1">
          <h2 className="text-lg font-medium">Tags</h2>
          {session ? (
            <TransactionTagsCombobox
              txId={tx.id}
              title="Add tags"
              options={tags || []}
              initialState={tx.tags}
            />
          ) : null}
        </div>
        <div className="flex gap-1">
          {tx.tags.length > 0 ? (
            tx.tags.map((tag) => (
              <Badge key={tag}>
                <Link href={`/tags/${encodeURIComponent(tag)}`}>{tag}</Link>
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No tags.</p>
          )}
        </div>
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
        {session && tx.attachment ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="border" disabled={isLoading}>
                {isLoading ? (
                  <>
                    Fetching attachment{' '}
                    <CircleNotch className="size-4 animate-spin" />
                  </>
                ) : (
                  'View attachment'
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Attachment</DialogTitle>
              </DialogHeader>
              {attachment?.attributes?.fileURL ? (
                <div className="relative w-full h-[32rem]">
                  <Image
                    className="object-contain"
                    src={attachment?.attributes.fileURL}
                    alt="Transaction attachment"
                    fill
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[32rem] gap-2">
                  <CircleNotch className="size-8 animate-spin" />
                  <p className="text-lg tracking-tight">Loading attachment</p>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <p className="text-muted-foreground text-sm">No attachment.</p>
        )}
      </div>
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
      staleTime: CachePresets.FIVE_MINUTES_IN_MS,
    }
  );

  return (
    <Sheet onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-scroll">
        <SheetHeader>
          <SheetTitle className="font-medium">Transaction</SheetTitle>
          {data?.deepLinkURL && (
            <div
              className="flex self-center items-center rounded-full gap-x-1 p-1 text-sm shadow-sm shadow-black/20 ring-1 ring-white/10 transition border border-transparent [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
              style={
                {
                  '--highlight': '210 40% 98%',

                  '--bg-color':
                    'linear-gradient(hsl(var(--background)), hsl(var(--background)))',
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
                  'rounded-full bg-transparent hover:bg-transparent h-4 font-semibold text-primary text-xs',
                  focusRing
                )}
                asChild
              >
                <Link href={data.deepLinkURL}>Open in Up</Link>
              </Button>
            </div>
          )}
        </SheetHeader>
        {isLoading || isError ? (
          <div className="flex flex-col w-full h-full">
            <div className="flex-1 flex flex-col items-center justify-center gap-2 m-auto">
              {isLoading ? (
                <>
                  <CircleNotch className="size-8 animate-spin" />
                  <p className="text-xl tracking-tight">
                    Loading transaction...
                  </p>
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
