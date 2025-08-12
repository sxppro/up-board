'use client';

import { formatCurrency } from '@/utils/helpers';
import { DonutChart, DonutChartProps } from '@tremor/react';

const ExpenseCategoriesDonut = ({
  className,
  colors,
  data,
  index,
}: DonutChartProps) => {
  return (
    <DonutChart
      className={className}
      data={data || []}
      index={index}
      colors={colors}
      valueFormatter={(number: number) => formatCurrency(number, false)}
      variant="donut"
      showAnimation
    />
  );
};

export default ExpenseCategoriesDonut;
