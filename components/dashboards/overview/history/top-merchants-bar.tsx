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
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BarList } from '@/components/ui/tremor/bar-list';
import { DateRange } from '@/server/schemas';
import { colours } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { CircleNotch } from '@phosphor-icons/react';
import { Text, Title } from '@tremor/react';
import { useState } from 'react';

const DESCRIPTION = 'Merchants ordered by spending, excluding refunds';

const TopMerchantsBar = ({ dateRange }: { dateRange: DateRange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: allMerchants } = trpc.public.getMerchantInfo.useQuery({
    dateRange,
    type: 'expense',
    options: {
      sort: {
        amount: 1,
        transactions: -1,
      },
    },
  });

  const chartData = allMerchants?.map((merchant) => ({
    ...merchant,
    value: merchant.absAmount,
    href: `/merchant/${encodeURIComponent(merchant.name)}`,
    colour: merchant.parentCategoryName
      ? `bg-${colours[merchant.parentCategoryName]} bg-opacity-60`
      : `bg-${colours['Uncategorised']} bg-opacity-60`,
  }));

  return (
    <section
      aria-label={DESCRIPTION}
      className="relative h-full border rounded-tremor-default flex flex-col gap-2 p-4"
    >
      <Title>Top Merchants</Title>
      <Text>{DESCRIPTION}</Text>
      {chartData ? (
        <BarList
          data={chartData.slice(0, 5)}
          valueFormatter={(number: number) => formatCurrency(number)}
          showAnimation
        />
      ) : (
        <Skeleton className="w-full h-48" />
      )}
      {chartData && chartData.length > 5 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background">
          <Button
            className="h-8"
            onClick={() => setIsDialogOpen(!isDialogOpen)}
          >
            View more
          </Button>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Merchants</DialogTitle>
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
                <p className="text-lg tracking-tight">Loading data</p>
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
    </section>
  );
};

export default TopMerchantsBar;
