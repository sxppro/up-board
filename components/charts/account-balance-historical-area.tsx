'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { AreaChart, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const AccountBalanceHistoricalArea = ({ accountId }: { accountId: string }) => {
  const { date } = useDate();
  const { data } = trpc.user.getAccountBalance.useQuery({
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
    accountId,
  });

  return (
    <DashboardCard>
      <Title>Balance</Title>
      <AreaChart
        className="w-full min-h-[20rem] h-full"
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
