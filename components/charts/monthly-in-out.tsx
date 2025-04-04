'use client';

import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { BarChart, Text, Title } from '@tremor/react';
import { startOfMonth, subYears } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

const currentDate = new Date();

const MonthlyInOut = ({ accountId }: { accountId?: string }) => {
  const { data, isLoading } = trpc.public.getIOStats.useQuery({
    accountId,
    dateRange: {
      from: startOfMonth(subYears(currentDate, 1)),
      to: currentDate,
    },
    options: { groupBy: 'monthly' },
  });

  return (
    <div className="h-full border rounded-tremor-default flex flex-col items-start gap-2 p-4">
      <div>
        <Title>Monthly Inflows & Outflows</Title>
        <Text>Past 12 months</Text>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-80" />
      ) : (
        <BarChart
          data={data || []}
          index="FormattedDate"
          categories={['In', 'Out']}
          colors={['indigo', 'fuchsia']}
          stack={false}
          yAxisWidth={60}
          valueFormatter={(number: number) => formatCurrency(number, false)}
          showAnimation
        />
      )}
    </div>
  );
};

export default MonthlyInOut;
