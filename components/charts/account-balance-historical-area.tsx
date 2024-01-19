'use client';

import { formatCurrency } from '@/utils/helpers';
import { useAccountBalanceHistorical, useDate } from '@/utils/hooks';
import { AreaChart, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const AccountBalanceHistoricalArea = () => {
  const { date } = useDate();
  const { data } = useAccountBalanceHistorical(date?.from, date?.to, 'savings');

  return (
    <DashboardCard>
      <Title>Balance</Title>
      <AreaChart
        className="flex-1"
        data={data}
        index="FormattedDate"
        categories={['Balance']}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default AccountBalanceHistoricalArea;
