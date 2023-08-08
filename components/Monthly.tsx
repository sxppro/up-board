'use client';
import { MonthlyMetric } from '@/types/custom';
import { useMonthlyMetrics } from '@/utils/fetch';
import { formatCurrency } from '@/utils/helpers';
import { BarChart, Card, Text, Title } from '@tremor/react';

const data = [
  {
    Month: 'Jan 21',
    Income: 2890,
    Expenses: 2400,
  },
  {
    Month: 'Feb 21',
    Income: 1890,
    Expenses: 1398,
  },
  // ...
  {
    Month: 'Jan 22',
    Income: 3890,
    Expenses: 2980,
  },
];

const currentDate = new Date();

const Monthly = () => {
  const { data, isLoading } = useMonthlyMetrics(currentDate);

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
        valueFormatter={(number: number) => formatCurrency(number)}
      />
    </Card>
  );
};

export default Monthly;
