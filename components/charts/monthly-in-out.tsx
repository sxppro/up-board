'use client';

import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { BarChart, Text, Title } from '@tremor/react';
import { format, startOfMonth, subYears } from 'date-fns';
import DashboardCard from '../core/dashboard-card';

const currentDate = new Date();

const MonthlyInOut = () => {
  const { data, isLoading } = trpc.user.getMonthlyInfo.useQuery({
    accountId: '',
    dateRange: {
      from: startOfMonth(subYears(currentDate, 1)),
      to: currentDate,
    },
  });
  const dataWithFormattedDate =
    !isLoading &&
    data &&
    data.map(({ Month, Year, ...rest }) => {
      const date = new Date(Year, Month - 1);
      return {
        ...rest,
        FormattedDate: format(date, 'LLL yy'),
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
        data={dataWithFormattedDate || []}
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
