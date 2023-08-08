'use client';
import { MonthlyMetric } from '@/types/custom';
import { useYearlyTransactions } from '@/utils/fetch';
import { BarChart, Card, Text, Title } from '@tremor/react';

const data = [
  {
    Month: 'Jan 21',
    Income: 2890,
    Spending: 2400,
  },
  {
    Month: 'Feb 21',
    income: 1890,
    spending: 1398,
  },
  // ...
  {
    Month: 'Jan 22',
    income: 3890,
    spending: 2980,
  },
];

const Monthly = () => {
  const currentDate = new Date('2022-12-31T12:59:59.999Z');
  const { data, isLoading } = useYearlyTransactions(currentDate);

  const metrics =
    !isLoading &&
    data &&
    data.map(({ Month, Year, ...rest }: MonthlyMetric) => ({
      ...rest,
      Year,
      Month: `${new Date(Year, Month).toLocaleDateString('default', {
        month: 'long',
      })} ${Year}`,
    }));

  return (
    <Card>
      <Title>Performance</Title>
      <Text>Comparison between Money Income and Expenses</Text>
      <BarChart
        className="mt-4 h-80"
        data={metrics}
        index="Month"
        categories={['Income', 'Expenses']}
        colors={['indigo', 'fuchsia']}
        stack={false}
        yAxisWidth={60}
        valueFormatter={(number: number) =>
          `$ ${Intl.NumberFormat('us').format(number).toString()}`
        }
      />
    </Card>
  );
};

export default Monthly;
