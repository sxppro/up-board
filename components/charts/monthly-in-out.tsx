'use client';

import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { BarChart, Text, Title } from '@tremor/react';
import { startOfMonth, subYears } from 'date-fns';
import DashboardCard from '../core/dashboard-card';

const currentDate = new Date();

const MonthlyInOut = ({ accountId }: { accountId: string }) => {
  const { data } = trpc.public.getIOStats.useQuery({
    accountId,
    dateRange: {
      from: startOfMonth(subYears(currentDate, 1)),
      to: currentDate,
    },
    options: { groupBy: 'monthly' },
  });

  return (
    <DashboardCard>
      <div>
        <Title>Income & Spending</Title>
        <Text>Monthly — Past 12 months</Text>
      </div>
      <BarChart
        data={data || []}
        index="FormattedDate"
        categories={['Income', 'Expenses']}
        colors={['indigo', 'fuchsia']}
        stack={false}
        yAxisWidth={60}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default MonthlyInOut;
