import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import DateRangeSelect from '@/components/date-range-select';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/tremor/accordion';
import { getCategories, getCategoryInfo, getCategoryInfoHistory } from '@/db';
import { DateRangeGroupBy } from '@/server/schemas';
import { DateRangePresets, PageProps } from '@/types/custom';
import { getDateRanges } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
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
  const categoryStatsHistory = await getCategoryInfoHistory(
    dateRange ? map.get(dateRange) || last30days : last30days,
    'parent',
    { groupBy }
  );
  const chartCategoryStats = categoryStatsHistory.map(
    ({ day, month, year, categories }) => {
      const date =
        day && month
          ? format(new Date(year, month - 1, day), 'd LLL yy')
          : month
          ? format(new Date(year, month - 1), 'LLL yy')
          : format(new Date(year, 0, 1), 'yyyy');
      const remappedElem: any = {
        FormattedDate: date,
      };
      categories.map(
        ({ amount, category }) => (remappedElem[category] = amount)
      );
      return remappedElem;
    }
  );
  const categories = await getCategories('parent');
  const categoryStats = await getCategoryInfo(
    dateRange ? map.get(dateRange) || last30days : last30days,
    'parent',
    {}
  );
  const subCategoryStats = await Promise.all(
    categoryStats.map(
      async ({ category }) =>
        await getCategoryInfo(
          dateRange ? map.get(dateRange) || last30days : last30days,
          'child',
          {},
          category
        )
    )
  );

  return (
    <NuqsAdapter>
      <section
        aria-labelledby="categories-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <div className="flex items-center justify-between">
            <h1
              id="categories-overview"
              className="text-2xl font-semibold tracking-tight"
            >
              Categories
            </h1>
            <DateRangeSelect selected={dateRange || DateRangePresets.MONTH} />
          </div>
          <Separator className="mt-2" />
        </div>
        <ExpenseCategoriesBar
          data={chartCategoryStats}
          categories={categories}
          index="FormattedDate"
        />
        <Accordion type="single" collapsible>
          {categoryStats.map(({ category, categoryName, amount }, index) => {
            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="py-2 gap-2">
                  <div
                    className={cn(
                      'inline-block h-6 w-1 rounded-full',
                      `bg-up-${category}`
                    )}
                  />
                  <div className="flex-1 flex justify-between">
                    <p>{categoryName}</p>
                    <p>{formatCurrency(amount)}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul role="list">
                    {subCategoryStats[index].map(
                      ({ category, categoryName, amount }) => (
                        <li
                          key={category}
                          className="w-full flex h-8 items-center overflow-hidden"
                        >
                          <p className="flex-1 text-subtle truncate">
                            {categoryName}
                          </p>
                          <span>{formatCurrency(amount)}</span>
                        </li>
                      )
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    </NuqsAdapter>
  );
};

export default CategoriesPage;
