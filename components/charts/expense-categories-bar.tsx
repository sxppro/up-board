'use client';

import { BarChartConfig } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { BarChart } from '@tremor/react';

const ExpenseCategoriesBar = ({
  data,
  categories,
  index,
  colors,
  ...props
}: BarChartConfig) => {
  return (
    <BarChart
      data={data || []}
      index={index}
      categories={categories || []}
      colors={colors}
      valueFormatter={(number: number) => formatCurrency(number, false)}
      showAnimation
      {...props}
    />
  );
};

export default ExpenseCategoriesBar;
