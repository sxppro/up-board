'use client';

import { DateRangeProps } from '@/types/custom';
import { colours } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { CategoryBar } from './tremor/category-bar';

const ExpenseCategoriesCategoryBar = ({ start, end }: DateRangeProps) => {
  const { date } = useDate();
  const { data, isError, isLoading } = trpc.public.getCategoryInfo.useQuery({
    dateRange: {
      from: start || date?.from,
      to: end || date?.to,
    },
    type: 'parent',
  });
  const total = useMemo(
    () => data?.reduce((acc, { amount }) => acc + amount, 0) || 1,
    [data]
  );

  if (isLoading || isError || !data)
    return <Skeleton className="sm:col-span-2 h-48" />;

  return (
    <div className="flex flex-col sm:col-span-2 gap-2">
      <h2 className="font-bold sm:text-sm">Expense Categories</h2>
      <p className="flex items-baseline gap-2">
        <span className="text-xl">{formatCurrency(total)}</span>
        <span className="text-sm text-muted dark:text-muted-foreground">
          Total expenses
        </span>
      </p>
      <CategoryBar
        values={data.map(({ amount }) => amount)}
        colors={data.map(({ categoryName }) => colours[categoryName])}
        showLabels={false}
      />
      <ul role="list" className="py-3 space-y-2">
        {data.map(({ category, categoryName, amount }) => (
          <li key={category} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                `bg-${colours[categoryName]}`,
                'size-2.5 rounded-sm'
              )}
              aria-hidden="true"
            />
            <span className="text-gray-900 dark:text-gray-50">
              {categoryName}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ({formatCurrency(amount)} / {((amount / total) * 100).toFixed(1)}
              %)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseCategoriesCategoryBar;
