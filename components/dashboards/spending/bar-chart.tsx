'use client';

import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import {
  TransactionCategoryInfoHistoryRaw,
  TransactionCategoryOption,
} from '@/server/schemas';
import { getDateRanges, TZ } from '@/utils/constants';
import { useDate } from '@/utils/hooks';
import { TZDate } from '@date-fns/tz';
import { EventProps } from '@tremor/react';
import { endOfMonth, format, parse, startOfMonth } from 'date-fns';

interface SpendingBarChart {
  stats: TransactionCategoryInfoHistoryRaw[];
  categories: TransactionCategoryOption[];
  selectedCategory?: TransactionCategoryOption;
}

/**
 * Client component to pass an event handler to
 * bar chart
 * @returns
 */
const SpendingBarChart = ({
  stats,
  categories,
  selectedCategory,
}: SpendingBarChart) => {
  const { setDate } = useDate();
  const { thisMonth } = getDateRanges();
  const chartStats = stats.map(({ month, year, categories }) => {
    const date =
      month && year
        ? format(new Date(year, month - 1), 'LLL yy')
        : format(new Date(year, 0, 1), 'yyyy');
    const remappedElem: any = {
      FormattedDate: date,
    };
    categories.map(({ amount, category }) => (remappedElem[category] = amount));
    return remappedElem;
  });
  const onValueChange = (e: EventProps & { FormattedDate: string }) => {
    if (e) {
      const { FormattedDate } = e;
      const date = parse(FormattedDate, 'LLL yy', TZDate.tz(TZ));
      setDate({ from: startOfMonth(date), to: endOfMonth(date) });
      console.log(date);
    } else {
      setDate(thisMonth);
    }
  };

  return (
    <ExpenseCategoriesBar
      data={chartStats}
      categories={
        selectedCategory
          ? [selectedCategory.name]
          : [...categories?.map(({ name }) => name), 'Uncategorised']
      }
      colors={
        selectedCategory
          ? [`up-${selectedCategory.id}`]
          : [
              'up-good-life',
              'up-home',
              'up-personal',
              'up-transport',
              'gray-300',
            ]
      }
      index="FormattedDate"
      // @ts-expect-error
      onValueChange={onValueChange}
      showLegend={false}
    />
  );
};

export default SpendingBarChart;
