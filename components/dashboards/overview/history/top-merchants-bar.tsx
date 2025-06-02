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
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BarList } from '@/components/ui/tremor/bar-list';
import { DateRange } from '@/server/schemas';
import { colours } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { CircleNotch } from '@phosphor-icons/react';
import { Text, Title } from '@tremor/react';
import { useCallback, useEffect, useState } from 'react';

const DESCRIPTION = 'Merchants ordered by spending, excluding refunds';

const TopMerchantsBar = ({ dateRange }: { dateRange: DateRange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gradientOpacity, setGradientOpacity] = useState(1);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null
  );
  const scrollContainerCallback = useCallback((node: HTMLDivElement | null) => {
    setScrollContainer(node);
  }, []);

  const { data: allMerchants, isLoading } =
    trpc.public.getMerchantInfo.useQuery({
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

  useEffect(() => {
    if (!isDialogOpen || !scrollContainer) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const maxScroll = target.scrollHeight - target.clientHeight;
      const currentScroll = target.scrollTop;

      // At bottom of scroll, opacity is 0, at top is 1
      const newOpacity = Math.min((maxScroll - currentScroll) / 100, 1);
      setGradientOpacity(newOpacity);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isDialogOpen, scrollContainer]);

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
          <div className="relative">
            <div
              ref={scrollContainerCallback}
              className="h-96 overflow-y-scroll"
            >
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
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background"
              style={{ opacity: gradientOpacity }}
            />
          </div>
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
