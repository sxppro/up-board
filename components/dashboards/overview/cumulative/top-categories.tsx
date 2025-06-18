'use client';

import ScrollableContent from '@/components/core/scrollable-content';
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

const DESCRIPTION = 'Categories ordered by total expenditure';

const TopCategories = ({ dateRange }: { dateRange: DateRange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: topCategories } = trpc.public.getCategoryInfo.useQuery({
    dateRange,
    type: 'child',
    options: {
      limit: 4,
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
  });
  const { data: allCategories } = trpc.public.getCategoryInfo.useQuery(
    {
      dateRange,
      type: 'child',
      options: {
        sort: {
          amount: 1,
          transactions: -1,
        },
      },
    },
    { enabled: isDialogOpen }
  );
  const chartData = allCategories?.map((category) => ({
    ...category,
    name: category.categoryName,
    value: category.absAmount,
    href: `/spending/${encodeURIComponent(category.category)}`,
    colour: category.parentCategoryName
      ? `bg-${colours[category.parentCategoryName]} bg-opacity-60`
      : `bg-${colours['Uncategorised']} bg-opacity-60`,
  }));

  return (
    <div className="flex-1 flex flex-col gap-1">
      <div className="flex gap-0.5">
        <span className="font-bold">Top Categories</span>
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
            <p className="text-sm">Categories ordered by total expenditure</p>
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
              <DialogTitle>Top Categories</DialogTitle>
              <DialogDescription>{DESCRIPTION}</DialogDescription>
            </DialogHeader>
            <ScrollableContent className="h-96">
              {chartData ? (
                <BarList
                  data={chartData}
                  valueFormatter={(number: number) => formatCurrency(number)}
                  showAnimation
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <CircleNotch className="size-8 animate-spin" />
                  <p className="text-lg tracking-tight">Loading data...</p>
                </div>
              )}
            </ScrollableContent>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Go back</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-1">
        {topCategories
          ? topCategories.map(
              ({
                category,
                categoryName,
                amount,
                absAmount,
                parentCategory,
              }) => (
                <div key={category} className="w-full flex h-8 items-center">
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
                      <Link href={`/spending/${encodeURIComponent(category)}`}>
                        {categoryName}
                      </Link>
                    </Button>
                  </div>
                  <span>{formatCurrencyAbsolute(absAmount, amount)}</span>
                </div>
              )
            )
          : [...Array(4).keys()].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
      </div>
    </div>
  );
};

export default TopCategories;
