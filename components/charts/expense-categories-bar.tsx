'use client';

import { BarChartConfig } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { BarChart } from '@tremor/react';

const ExpenseCategoriesBar = ({ data, categories, index }: BarChartConfig) => {
  return (
    <BarChart
      data={data || []}
      index={index}
      categories={
        categories
          ? [...categories?.map(({ name }) => name), 'Uncategorised']
          : []
      }
      colors={[
        'up-good-life',
        'up-home',
        'up-personal',
        'up-transport',
        'gray-300',
      ]}
      valueFormatter={(number: number) => formatCurrency(number, false)}
      showAnimation
    />
  );
};

export default ExpenseCategoriesBar;
