import { formatCurrency } from '@/utils/helpers';
import { useCategoryMetrics, useDate } from '@/utils/hooks';
import { Card, DonutChart, Legend, Title } from '@tremor/react';

const Categories = () => {
  const { date } = useDate();
  const { data, isLoading } = useCategoryMetrics(
    date?.from,
    date?.to,
    'parent'
  );

  return (
    <Card className="h-84">
      <Title>Expense Categories</Title>
      <Legend
        categories={
          isLoading || !data
            ? []
            : data.map(({ category }: { category: string }) => category)
        }
      />
      <DonutChart
        className="mt-4 h-80"
        data={data}
        category="amount"
        index="category"
        valueFormatter={(number: number) => formatCurrency(number, true)}
        onValueChange={(v) => console.log(v?.category)}
        showAnimation
      />
    </Card>
  );
};

export default Categories;
