'use client';

import { MonthlyMetric } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useMonthlyMetrics } from '@/utils/hooks';
import { BarChart, Text, Title } from '@tremor/react';
import { startOfMonth, subYears } from 'date-fns';
import DashboardCard from './core/dashboard-card';

const currentDate = new Date();

const Monthly = () => {
  const { data, isLoading } = useMonthlyMetrics(
    startOfMonth(subYears(currentDate, 1)),
    currentDate
  );

  const metrics =
    !isLoading &&
    data &&
    data.map(({ Month, Year, ...rest }: MonthlyMetric) => {
      const date = new Date(Year, Month);
      return {
        ...rest,
        Time: `${date.toLocaleDateString('default', {
          month: 'short',
        })} ${date.toLocaleDateString('default', {
          year: '2-digit',
        })}`,
      };
    });

  return (
    <DashboardCard>
      <div>
        <Title>Monthly Comparison</Title>
        <Text>Total income and expenses by month</Text>
      </div>
      <BarChart
        className="flex-1"
        data={metrics}
        index="Time"
        categories={['Income', 'Expenses']}
        colors={['indigo', 'fuchsia']}
        stack={false}
        yAxisWidth={60}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default Monthly;
