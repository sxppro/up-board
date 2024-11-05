import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import AnimatedTabs from '@/components/core/animated-tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/tremor/accordion';
import {
  getAccounts,
  getAccountStats,
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
} from '@/db';
import { getDateRanges, now } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import { Card } from '@tremor/react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { domMax, LazyMotion } from 'framer-motion';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const CategoriesPage = async () => {
  const dateRange = {
    from: startOfMonth(subMonths(now, 3)),
    to: now,
  };
  const { thisMonth } = getDateRanges();
  const transactionAcc = await getAccounts('TRANSACTIONAL', {
    sort: { 'attributes.balance.valueInBaseUnits': -1 },
    limit: 1,
  });
  const monthStats = await getAccountStats(transactionAcc[0].id, thisMonth);
  const avgStats = await getAccountStats(
    transactionAcc[0].id,
    {
      from: startOfMonth(subMonths(now, 3)),
      to: endOfMonth(subMonths(now, 1)),
    },
    'monthly',
    true
  );
  const monthlyChange =
    ((monthStats[0]?.Expenses - avgStats[0]?.Expenses) /
      avgStats[0]?.Expenses) *
    100;
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
      <LazyMotion features={domMax}>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="ring-border bg-background p-3">
              <div className="flex gap-1">
                <p className="text-muted-foreground">This month</p>
                {isNaN(monthlyChange) ? (
                  ''
                ) : (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'px-1.5 rounded-md',
                      monthlyChange > 0
                        ? 'bg-rose-100 hover:bg-rose-100/80 text-rose-800 dark:bg-rose-400/10 dark:text-rose-400 dark:hover:bg-rose-400/20'
                        : monthlyChange < 0
                        ? 'bg-green-100 hover:bg-green-100/80 text-green-800 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20'
                        : ''
                    )}
                  >
                    {`${monthlyChange.toFixed(1)}%`}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-semibold">
                {formatCurrency(monthStats[0]?.Expenses)}
              </p>
            </Card>
            <Card className="ring-border bg-background p-3">
              <p className="text-muted-foreground">Average (last 3 months)</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(avgStats[0]?.Expenses)}
              </p>
            </Card>
          </div>
          <AnimatedTabs
            tabs={categories.map(({ id, name }) => ({
              id,
              label: name,
              colour: `bg-up-${id}`,
            }))}
          />
          <ExpenseCategoriesBar
            data={chartCategoryStats}
            categories={categories}
            index="FormattedDate"
            showLegend={false}
          />
          <div>
            <h2 className="text-lg font-semibold">This month</h2>
            <Accordion type="single" collapsible>
              {categoryStats.map(
                ({ category, categoryName, amount }, index) => {
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
                }
              )}
            </Accordion>
          </div>
        </section>
      </LazyMotion>
    </NuqsAdapter>
  );
};

export default CategoriesPage;
