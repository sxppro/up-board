'use client';

import { DateRangeProps } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { BarChart, Subtitle, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const ExpenseCategoriesStackedBar = ({ start, end }: DateRangeProps) => {
  const { date } = useDate();
  const { data } = trpc.user.getCategoryInfoHistory.useQuery({
    dateRange: {
      from: start || date?.from,
      to: end || date?.to,
    },
    type: 'parent',
  });
  const { data: categories } = trpc.user.getCategories.useQuery('parent');
  return (
    <DashboardCard>
      <Title>Spending</Title>
      <Subtitle>Last 6 months</Subtitle>
      <BarChart
        data={data || []}
        index={'FormattedDate'}
        categories={
          categories
            ? [...categories?.map(({ name }) => name), 'Uncategorised']
            : []
        }
        colors={[
          'up-good-life',
          'up-home',
          'up-personal',
          'up-transport',
          'gray-300',
        ]}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        onValueChange={(v) => console.log(v)}
        stack
      />
    </DashboardCard>
  );
};

export default ExpenseCategoriesStackedBar;
