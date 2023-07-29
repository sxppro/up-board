'use client';
import { BarChart, Card, Text, Title } from '@tremor/react';

const data = [
  {
    Month: 'Jan 21',
    In: 2890,
    Out: 2400,
  },
  {
    Month: 'Feb 21',
    In: 1890,
    Out: 1398,
  },
  // ...
  {
    Month: 'Jan 22',
    In: 3890,
    Out: 2980,
  },
];

const Monthly = () => {
  return (
    <Card>
      <Title>Performance</Title>
      <Text>Comparison between Money In and Out</Text>
      <BarChart
        className="mt-4 h-80"
        data={data}
        index="Month"
        categories={['In', 'Out']}
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
