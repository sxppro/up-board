'use client';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { LineChart } from '@tremor/react';
import { startOfMonth } from 'date-fns';

interface CumulativeSnapshotProps {
  accountId: string;
}

const now = new Date();

const CumulativeSnapshot = ({ accountId }: CumulativeSnapshotProps) => {
  const { data } = trpc.public.getCumulativeIO.useQuery({
    accountId,
    dateRange: {
      from: startOfMonth(now),
      to: now,
    },
    type: 'income',
  });

  return (
    <section aria-labelledby="overview-income">
      <div>
        <div className="flex items-center justify-between">
          <h1
            id="overview-income"
            className="text-2xl font-semibold tracking-tight"
          >
            Income
          </h1>
          <p className="text-sm text-muted dark:text-muted-foreground">
            Updated today 18:30
          </p>
        </div>
        <Separator className="my-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {data ? (
          <LineChart
            className="xl:col-span-2 h-64 sm:h-96"
            data={data}
            index="FormattedDate"
            categories={['AmountCumulative']}
            valueFormatter={(number: number) => formatCurrency(number, false)}
            showLegend={false}
            showAnimation
          />
        ) : (
          <Skeleton className="w-full h-64 sm:h-96" />
        )}
      </div>
    </section>
  );
};

export default CumulativeSnapshot;
