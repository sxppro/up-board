import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import DateRangeSelect from '@/components/date-range-select';
import { Separator } from '@/components/ui/separator';
import { getCategories, getCategoryInfoHistory } from '@/db';
import { PageProps } from '@/types/custom';
import { now } from '@/utils/constants';
import { format, subMonths } from 'date-fns';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const CategoriesPage = async ({ searchParams }: PageProps) => {
  const { range } = searchParams;
  const dateRange = Array.isArray(range) ? range[0] : range;
  const categoryStats = await getCategoryInfoHistory(
    {
      from: subMonths(now, 3),
      to: now,
    },
    'parent'
  );
  const chartCategoryStats = categoryStats.map(
    ({ month, year, categories }) => {
      // @ts-expect-error
      const remappedElem: TransactionCategoryInfoHistory = {
        FormattedDate: format(new Date(year, month - 1), 'LLL yy'),
      };
      categories.map(
        ({ amount, category }) => (remappedElem[category] = amount)
      );
      return remappedElem;
    }
  );
  const categories = await getCategories('parent');

  return (
    <NuqsAdapter>
      <section
        aria-labelledby="categories-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <div className="flex items-center justify-between">
            <h1
              id="accounts-overview"
              className="text-2xl font-semibold tracking-tight"
            >
              Categories
            </h1>
            <DateRangeSelect selected={dateRange} />
          </div>
          <Separator className="mt-2" />
        </div>
        <ExpenseCategoriesBar
          data={chartCategoryStats}
          categories={categories}
          index="FormattedDate"
        />
      </section>
    </NuqsAdapter>
  );
};

export default CategoriesPage;
