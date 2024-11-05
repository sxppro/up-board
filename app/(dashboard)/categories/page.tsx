import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/tremor/accordion';
import { getCategories, getCategoryInfo, getCategoryInfoHistory } from '@/db';
import { getDateRanges, now } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import { format, startOfMonth, subMonths } from 'date-fns';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const CategoriesPage = async () => {
  const dateRange = {
    from: startOfMonth(subMonths(now, 3)),
    to: now,
  };
  const { thisMonth } = getDateRanges();
  const categoryStatsHistory = await getCategoryInfoHistory(
    dateRange,
    'parent',
    { groupBy: 'monthly' }
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
  const categoryStats = await getCategoryInfo(thisMonth, 'parent', {});
  const subCategoryStats = await Promise.all(
    categoryStats.map(
      async ({ category }) =>
        await getCategoryInfo(thisMonth, 'child', {}, category)
    )
  );

  return (
    <NuqsAdapter>
      <section
        aria-labelledby="categories-overview"
        className="flex flex-col gap-3"
      >
        <div>
          <h1
            id="categories-overview"
            className="text-2xl font-semibold tracking-tight"
          >
            Spending
          </h1>
          <Separator className="mt-2" />
        </div>
        <ExpenseCategoriesBar
          data={chartCategoryStats}
          categories={categories}
          index="FormattedDate"
        />
        <div>
          <h2 className="text-lg font-semibold">This month</h2>
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
                    <div className="flex-1 flex justify-between text-base">
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
        </div>
      </section>
    </NuqsAdapter>
  );
};

export default CategoriesPage;
