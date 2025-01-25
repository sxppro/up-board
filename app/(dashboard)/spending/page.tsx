import AnimatedTabs from '@/components/core/animated-tabs';
import SpendingBarChart from '@/components/dashboards/spending/bar-chart';
import SpendingDetails from '@/components/dashboards/spending/details';
import DateProvider from '@/components/providers/date-provider';
import QueryProvider from '@/components/providers/query-provider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
  getIOStats,
} from '@/db';
import { PageProps } from '@/types/custom';
import { now } from '@/utils/constants';
import {
  calcPercentDiff,
  cn,
  formatCurrency,
  getDateRanges,
} from '@/utils/helpers';
import { Card } from '@tremor/react';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { domMax, LazyMotion } from 'framer-motion';
import { redirect } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const SpendingPage = async ({ searchParams }: PageProps) => {
  const { category: id } = searchParams;
  const categoryId = Array.isArray(id) ? id[0] : id;
  const categories = await getCategories('parent');
  const category = categories.find(({ id }) => id === categoryId);

  if (categoryId && !category) {
    return redirect('/spending');
  }

  const dateRange = category
    ? {
        from: startOfMonth(subMonths(now, 12)),
        to: now,
      }
    : {
        from: startOfMonth(subMonths(now, 3)),
        to: now,
      };
  const { thisMonth } = getDateRanges();
  const monthStats = await getIOStats(
    category && {
      match: { 'relationships.parentCategory.data.id': category.id },
    },
    thisMonth
  );
  const avgStats = await getIOStats(
    {
      groupBy: 'monthly',
      ...(category && {
        match: { 'relationships.parentCategory.data.id': category.id },
      }),
    },
    {
      from: startOfMonth(subMonths(now, 3)),
      to: endOfMonth(subMonths(now, 1)),
    },
    undefined,
    true
  );
  const monthlyChange = calcPercentDiff(monthStats[0]?.Out, avgStats[0]?.Out);
  const categoryStatsHistory = await getCategoryInfoHistory(
    dateRange,
    'parent',
    {
      groupBy: 'monthly',
      ...(category && {
        match: { 'relationships.parentCategory.data.id': category.id },
      }),
    }
  );
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
        <QueryProvider>
          <section
            aria-labelledby="categories-overview"
            className="flex flex-col gap-3"
          >
            <div>
              <h1
                id="categories-overview"
                className="text-2xl font-semibold tracking-tight"
              >
                {category?.name || 'Spending'}
              </h1>
              <Separator className="mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
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
                      {`${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(
                        1
                      )}%`}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(monthStats[0]?.Out)}
                </p>
              </Card>
              <Card className="ring-border bg-background p-3">
                <p className="text-muted-foreground">
                  Average per month (last 3 months)
                </p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(avgStats[0]?.Out)}
                </p>
              </Card>
            </div>
            <AnimatedTabs
              className="justify-center"
              queryParam="category"
              tabs={categories.map(({ id, name }) => ({
                id,
                label: name,
                colour: `bg-up-${id}`,
              }))}
            />
            <DateProvider start={thisMonth.from} end={thisMonth.to}>
              <SpendingBarChart
                stats={categoryStatsHistory}
                categories={categories}
                selectedCategory={category}
              />
              <SpendingDetails
                categoryStats={categoryStats}
                subCategoryStats={subCategoryStats}
                selectedCategory={category}
              />
            </DateProvider>
          </section>
        </QueryProvider>
      </LazyMotion>
    </NuqsAdapter>
  );
};

export default SpendingPage;
