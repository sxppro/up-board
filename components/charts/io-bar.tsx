'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { BarChart } from '@tremor/react';
import { PropsWithChildren } from 'react';
import DashboardCard from '../core/dashboard-card';
import TableSkeleton from '../core/table-skeleton';

interface IOBarProps {
  accountId: string;
}

export const IOBarLoading = () => (
  <DashboardCard>
    <TableSkeleton cols={2} rows={7} />
  </DashboardCard>
);

const IOBar = ({ children, accountId }: IOBarProps & PropsWithChildren) => {
  const { date } = useDate();

  const { data } = trpc.user.getMonthlyInfo.useQuery({
    accountId,
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
  });

  return (
    <DashboardCard>
      {children}
      <BarChart
        index="Index"
        data={
          Array.isArray(data) && data.length > 0
            ? [
                {
                  Index: 'In',
                  Value: data[0].Income,
                },
                {
                  Index: 'Out',
                  Value: data[0].Expenses,
                },
              ]
            : []
        }
        categories={['Value']}
        colors={['indigo', 'fuchsia']}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
        showLegend={false}
      />
    </DashboardCard>
  );
};

export default IOBar;
