'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { BarList } from '@/components/ui/tremor/bar-list';
import { DateRange } from '@/server/schemas';
import { colours } from '@/utils/constants';
import { cn, formatCurrency, formatCurrencyAbsolute } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { CircleNotch, Info } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

const DESCRIPTION = 'Merchants ordered by total expenditure, excluding refunds';

const TopMerchants = ({ dateRange }: { dateRange: DateRange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: topMerchants } = trpc.public.getMerchantInfo.useQuery({
    dateRange,
    type: 'expense',
    options: {
      limit: 4,
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
  });
  const { data: allMerchants } = trpc.public.getMerchantInfo.useQuery(
    {
      dateRange,
      type: 'expense',
      options: {
        sort: {
          amount: 1,
          transactions: -1,
        },
      },
    },
    { enabled: isDialogOpen }
  );
  const chartData = allMerchants?.map((merchant) => ({
    ...merchant,
    value: merchant.absAmount,
    href: `/merchant/${encodeURIComponent(merchant.name)}`,
    colour: merchant.parentCategoryName
      ? `bg-${colours[merchant.parentCategoryName]} bg-opacity-60`
      : `bg-${colours['Uncategorised']} bg-opacity-60`,
  }));

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex gap-0.5">
        <span className="font-bold">Top Merchants</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-auto w-auto rounded-full p-1"
            >
              <Info />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <p className="text-sm">{DESCRIPTION}</p>
          </PopoverContent>
        </Popover>

        <Dialog onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-6 px-2 shadow ml-auto text-tremor-brand dark:text-dark-tremor-brand"
            >
              View more
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Top Merchants</DialogTitle>
              <DialogDescription>{DESCRIPTION}</DialogDescription>
            </DialogHeader>
            <div className="h-96 overflow-y-scroll">
              {chartData ? (
                <BarList
                  data={chartData}
                  valueFormatter={(number: number) => formatCurrency(number)}
                  showAnimation
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <CircleNotch className="size-8 animate-spin" />
                  <p className="text-lg tracking-tight">Loading data</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Go back</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-1">
        {topMerchants
          ? topMerchants.map(({ name, amount, absAmount, parentCategory }) => (
              <div key={name} className="w-full flex h-8 items-center">
                <div className="flex flex-1 gap-2 overflow-hidden">
                  <div
                    className={cn(
                      'inline-block h-6 w-1 rounded-full',
                      parentCategory
                        ? `bg-up-${parentCategory}`
                        : 'bg-up-uncategorised'
                    )}
                  />
                  <Button
                    variant="link"
                    className="h-6 p-0 text-subtle text-base truncate underline"
                    asChild
                  >
                    <Link href={`/merchant/${encodeURIComponent(name)}`}>
                      {name}
                    </Link>
                  </Button>
                </div>
                <span>{formatCurrencyAbsolute(absAmount, amount)}</span>
              </div>
            ))
          : [...Array(4).keys()].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
      </div>
    </div>
  );
};

export default TopMerchants;
