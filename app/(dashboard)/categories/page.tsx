import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import DateRangeSelect from '@/components/date-range-select';
import { Separator } from '@/components/ui/separator';
import { getCategories, getCategoryInfoHistory } from '@/db';
import { DateRangeGroupBy } from '@/server/schemas';
import { DateRangePresets, PageProps } from '@/types/custom';
import { getDateRanges } from '@/utils/constants';
import { format } from 'date-fns';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const CategoriesPage = async ({ searchParams }: PageProps) => {
  const { range } = searchParams;
  const dateRange = Array.isArray(range) ? range[0] : range;
  const { last30days, map } = getDateRanges();
  let groupBy: DateRangeGroupBy = 'monthly';

  if (
    dateRange === DateRangePresets.TODAY ||
    dateRange === DateRangePresets.WEEK ||
    !dateRange
  ) {
    groupBy = 'daily';
  }
  const categoryStats = await getCategoryInfoHistory(
    dateRange ? map.get(dateRange) || last30days : last30days,
    'parent',
    { groupBy }
  );
  const chartCategoryStats = categoryStats.map(
    ({ day, month, year, categories }) => {
      const date =
        day && month
          ? format(new Date(year, month - 1, day), 'd LLL yy')
          : month
          ? format(new Date(year, month - 1), 'LLL yy')
          : format(new Date(year, 0, 1), 'yyyy');
      // @ts-expect-error
      const remappedElem: TransactionCategoryInfoHistory = {
        FormattedDate: date,
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
