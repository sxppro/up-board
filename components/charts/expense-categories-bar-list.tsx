'use client';

import { DateRangeProps } from '@/types/custom';
import { colours } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { BarList, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const ExpenseCategoriesBarList = ({ start, end }: DateRangeProps) => {
  const { date } = useDate();
  const { data: rawData, isError } = trpc.user.getCategoryInfo.useQuery({
    dateRange: {
      from: start || date?.from,
      to: end || date?.to,
    },
    type: 'parent',
  });
  const data = isError
    ? []
    : rawData
    ? rawData.map(({ category, amount }) => ({
        name: category,
        value: amount,
        color: colours[category],
      }))
    : [];

  return (
    <DashboardCard>
      <Title>Spending by Category</Title>
      <p className="w-full mt-4 text-tremor-default flex items-center justify-between text-tremor-content dark:text-dark-tremor-content">
        <span>Category</span>
        <span>Total</span>
      </p>
      <BarList
        className="w-full h-full"
        data={data}
        valueFormatter={(number: number) => formatCurrency(number, true)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default ExpenseCategoriesBarList;
