'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { AreaChart, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const AccountBalanceHistoricalArea = () => {
  const { date } = useDate();
  const { data } = trpc.user.getAccountBalance.useQuery({
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
    account: 'savings',
  });

  return (
    <DashboardCard>
      <Title>Balance</Title>
      <AreaChart
        className="flex-1"
        data={data || []}
        index="FormattedDate"
        categories={['Balance']}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default AccountBalanceHistoricalArea;
