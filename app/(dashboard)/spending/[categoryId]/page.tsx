import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import { Separator } from '@/components/ui/separator';
import { getCategoryById, getCategoryInfoHistory } from '@/db';
import { formatHistoricalData, getDateRanges } from '@/utils/helpers';
import { startOfMonth } from 'date-fns';
import { redirect } from 'next/navigation';

const SpendingSubcategoryPage = async ({
  params,
}: {
  params: { categoryId: string };
}) => {
  const { categoryId } = params;
  const category = decodeURIComponent(categoryId);
  // ! Only supports subcategories for the time being,
  // ! parent categories are at /spending?category=name
  const categoryDetails = await getCategoryById(category);

  if (categoryDetails) {
    const { last12months } = getDateRanges();
    const roundedDateRange = {
      from: startOfMonth(last12months.from),
      to: last12months.to,
    };
    const categoryStatsHistory = await getCategoryInfoHistory(
      roundedDateRange,
      'child',
      {
        groupBy: 'monthly',
        match: { 'relationships.category.data.id': categoryDetails.id },
      }
    );
    const chartStats = formatHistoricalData(
      categoryStatsHistory,
      roundedDateRange,
      'monthly'
    );

    return (
      <section
        aria-labelledby="subcategory-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <h1
            id="categories-overview"
            className="text-2xl font-semibold tracking-tight"
          >
            {categoryDetails.name}
          </h1>
          <Separator className="mt-2" />
        </div>
        <ExpenseCategoriesBar
          data={chartStats}
          index="FormattedDate"
          categories={[categoryDetails.name]}
          colors={[`up-${categoryDetails.parentCategory}`]}
          showLegend={false}
        />
      </section>
    );
  }

  return redirect('/spending');
};

export default SpendingSubcategoryPage;
