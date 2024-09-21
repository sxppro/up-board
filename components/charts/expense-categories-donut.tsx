'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { CustomTooltipProps, DonutChart, Legend, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';
import { Skeleton } from '../ui/skeleton';

const ExpenseCategoriesDonutTooltip = ({
  payload,
  active,
}: CustomTooltipProps) => {
  if (!active || !payload) return null;
  const categoryPayload = payload?.[0];
  if (!categoryPayload) return null;
  return (
    <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown dark:border-dark-tremor-border">
      <div className="flex flex-1 space-x-2.5">
        <div
          className={`w-1.5 flex flex-col bg-${categoryPayload?.color}-500 rounded`}
        />
        <div className="w-full">
          <div className="flex items-center justify-between space-x-8">
            <p className="text-right text-tremor-content dark:text-dark-tremor-content whitespace-nowrap">
              {categoryPayload.name}
            </p>
            <p className="font-medium text-right whitespace-nowrap text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
              {categoryPayload.value &&
                formatCurrency(categoryPayload.value as number)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseCategoriesDonut = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.public.getCategoryInfo.useQuery({
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
    type: 'parent',
  });

  return (
    <DashboardCard>
      <Title>Expense Categories</Title>
      {isLoading || !data ? (
        <>
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </>
      ) : (
        <Legend
          categories={data.map(
            ({ categoryName }: { categoryName: string }) => categoryName
          )}
        />
      )}
      <DonutChart
        className="h-80"
        data={data || []}
        category="amount"
        index="category"
        valueFormatter={(number) => formatCurrency(number, true)}
        onValueChange={(v) => console.log(v)}
        customTooltip={ExpenseCategoriesDonutTooltip}
        showAnimation
      />
    </DashboardCard>
  );
};

export default ExpenseCategoriesDonut;
