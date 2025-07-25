'use client';

import { DateRange } from '@/server/schemas';
import { AccountType } from '@/types/custom';
import { cn, formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { AreaChart } from '@tremor/react';

const AccountBalanceHistory = ({
  accountId,
  accountType,
  className,
  dateRange,
}: {
  accountId?: string;
  accountType?: AccountType;
  className?: string;
  dateRange: DateRange;
}) => {
  const { data } = trpc.public.getAccountBalance.useQuery({
    dateRange: dateRange,
    accountId,
    accountType,
  });

  return (
    <AreaChart
      className={cn('w-full min-h-[20rem]', className)}
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
