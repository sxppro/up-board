'use client';

import { MonthlyMetric } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useMonthlyMetrics } from '@/utils/hooks';
import { BarChart, Card, Text, Title } from '@tremor/react';
import { startOfMonth, subYears } from 'date-fns';

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
    <Card>
      <Title>Monthly Comparison</Title>
      <Text>Total income and expenses by month</Text>
      <BarChart
        className="mt-4 h-80"
        data={metrics}
        index="Time"
        categories={['Income', 'Expenses']}
        colors={['indigo', 'fuchsia']}
        stack={false}
        yAxisWidth={60}
        valueFormatter={(number: number) => formatCurrency(number, false)}
        showAnimation
      />
    </Card>
  );
};

export default Monthly;
