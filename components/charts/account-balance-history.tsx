'use client';

import { AccountType } from '@/types/custom';
import { formatCurrency, getDateRanges } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { AreaChart } from '@tremor/react';

const AccountBalanceHistory = ({
  accountId,
  accountType,
}: {
  accountId?: string;
  accountType?: AccountType;
}) => {
  const { last12months } = getDateRanges();
  const { data } = trpc.public.getAccountBalance.useQuery({
    dateRange: last12months,
    accountId,
    accountType,
  });

  return (
    <AreaChart
      className="w-full min-h-[20rem]"
      data={data || []}
      index="FormattedDate"
      categories={['Balance']}
      valueFormatter={(number: number) => formatCurrency(number, false)}
      showAnimation
      showLegend={false}
      showYAxis={false}
    />
  );
};

export default AccountBalanceHistory;
