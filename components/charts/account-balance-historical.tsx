import { useAccountBalanceHistorical, useDate } from '@/utils/hooks';
import { AreaChart, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const AccountBalanceHistorical = () => {
  const { date } = useDate();
  const { data } = useAccountBalanceHistorical(date?.from, date?.to, 'savings');

  return (
    <DashboardCard>
      <Title>Balance</Title>
      <AreaChart
        className="flex-1"
        data={data}
        index={data ? `${data.Day}-${data.Month}` || '' : ''}
        categories={['Balance']}
        showAnimation
      />
    </DashboardCard>
  );
};

export default AccountBalanceHistorical;
