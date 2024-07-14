'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { BarChart, Subtitle, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const ExpenseCategoriesStackedBar = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getCategoryInfoHistory.useQuery({
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
    type: 'parent',
  });
  const { data: categories } = trpc.user.getCategories.useQuery('parent');
  return (
    <DashboardCard>
      <Title>Spending</Title>
      <Subtitle>Last 6 months</Subtitle>
      {/* {isLoading || !data ? (
        <Skeleton className="w-full h-4" />
      ) : (
        <Legend
          categories={data.map(
            ({ category }: { category: string }) => category
          )}
        />
      )} */}
      <BarChart
        data={data || []}
        index={'FormattedDate'}
        categories={
          categories
            ? [...categories?.map(({ name }) => name), 'Uncategorised']
            : []
        }
        valueFormatter={(number: number) => formatCurrency(number, false)}
        stack
      />
    </DashboardCard>
  );
};

export default ExpenseCategoriesStackedBar;
