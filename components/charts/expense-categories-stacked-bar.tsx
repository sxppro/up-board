'use client';

import { DateRangeProps } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { BarChart, EventProps, Text, Title } from '@tremor/react';
import { useState } from 'react';
import DashboardCard from '../core/dashboard-card';

const ExpenseCategoriesStackedBar = ({ start, end }: DateRangeProps) => {
  const { date } = useDate();
  const [category, setCategory] = useState<string | null>();
  const { data } = trpc.user.getCategoryInfoHistory.useQuery({
    dateRange: {
      from: start || date?.from,
      to: end || date?.to,
    },
    type: 'parent',
  });
  const { data: categories } = trpc.user.getCategories.useQuery('parent');

  const handleChartInteraction = (event: EventProps) => {
    if (event) {
      const { eventType, categoryClicked } = event;
      if (eventType === 'category') {
        setCategory(categoryClicked);
      }
    } else {
      setCategory(null);
    }
  };

  return (
    <DashboardCard>
      <div>
        <Title>Spending</Title>
        <Text>Last 6 months</Text>
      </div>
      <BarChart
        data={data || []}
        index={'FormattedDate'}
        categories={
          categories
            ? category
              ? [category]
              : [...categories?.map(({ name }) => name), 'Uncategorised']
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
        onValueChange={(v) => handleChartInteraction(v)}
        stack
      />
    </DashboardCard>
  );
};

export default ExpenseCategoriesStackedBar;
