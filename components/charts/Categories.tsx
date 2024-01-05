import { formatCurrency } from '@/utils/helpers';
import { useCategoryMetrics, useDate } from '@/utils/hooks';
import { Card, DonutChart, Title } from '@tremor/react';

const Categories = () => {
  const { date } = useDate();
  const { data, isLoading } = useCategoryMetrics(
    date?.from,
    date?.to,
    'parent'
  );

  return (
    <Card className="h-full">
      <Title>Expense Categories</Title>
      <DonutChart
        className="mt-4 h-80"
        data={data}
        category="amount"
        index="category"
        valueFormatter={(number: number) => formatCurrency(number, true)}
        onValueChange={(v) => console.log(v?.category)}
      />
    </Card>
  );
};

export default Categories;
