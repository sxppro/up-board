'use client';
import { BarChart, Card, Text, Title } from '@tremor/react';

const data = [
  {
    Month: 'Jan 21',
    Income: 2890,
    Spending: 2400,
  },
  {
    Month: 'Feb 21',
    Income: 1890,
    Spending: 1398,
  },
  // ...
  {
    Month: 'Jan 22',
    Income: 3890,
    Spending: 2980,
  },
];

const Monthly = () => {
  return (
    <Card>
      <Title>Performance</Title>
      <Text>Comparison between Money Income and Spending</Text>
      <BarChart
        className="mt-4 h-80"
        data={data}
        index="Month"
        categories={['Income', 'Spending']}
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
