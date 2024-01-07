import { formatCurrency } from '@/utils/helpers';
import { useCategoryMetrics, useDate } from '@/utils/hooks';
import { DonutChart, Legend, Title } from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const ExpenseCategories = () => {
  const { date } = useDate();
  const { data, isLoading } = useCategoryMetrics(
    date?.from,
    date?.to,
    'parent'
  );

  return (
    <DashboardCard>
      <Title>Expense Categories</Title>
      <Legend
        categories={
          isLoading || !data
            ? []
            : data.map(({ category }: { category: string }) => category)
        }
      />
      <DonutChart
        className="h-80"
        data={data}
        category="amount"
        index="category"
        valueFormatter={(number: number) => formatCurrency(number, true)}
        onValueChange={(v) => console.log(v?.category)}
        showAnimation
      />
    </DashboardCard>
  );
};

export default ExpenseCategories;
