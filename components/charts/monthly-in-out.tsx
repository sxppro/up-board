'use client';

import { formatCurrency, formatDateFromNums } from '@/utils/helpers';
import { useMonthlyMetrics } from '@/utils/hooks';
import { BarChart, Text, Title } from '@tremor/react';
import { startOfMonth, subYears } from 'date-fns';
import DashboardCard from '../core/dashboard-card';

const currentDate = new Date();

const MonthlyInOut = () => {
  const { data, isLoading } = useMonthlyMetrics(
    startOfMonth(subYears(currentDate, 1)),
    currentDate
  );

  const metrics = !isLoading && data && formatDateFromNums(data);

  return (
    <DashboardCard>
      <div>
        <Title>Monthly Comparison</Title>
        <Text>Total income and expenses by month</Text>
      </div>
      <BarChart
        className="flex-1"
        data={metrics ? metrics : []}
        index="FormattedDate"
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

export default MonthlyInOut;
