'use client';

import { CategoryBar } from '@/components/charts/tremor/category-bar';
import DateRangeSelect from '@/components/date-range-select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/tremor/accordion';
import { AvailableChartColors, chartColors } from '@/utils/charts';
import { colours } from '@/utils/constants';
import { cn, formatCurrency } from '@/utils/helpers';
import { useDateRange } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';

const Summary = () => {
  const { dateRange } = useDateRange();
  const { data: expenses } = trpc.public.getCategoryInfo.useQuery({
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    type: 'parent',
    options: {
      sort: {
        absAmount: -1,
      },
    },
  });
  const { data: income } = trpc.public.getMerchantInfo.useQuery({
    options: {
      limit: 5,
    },
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    type: 'income',
  });
  const { data: monthly } = trpc.public.getIOStats.useQuery({
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
  });

  return (
    <section aria-labelledby="overview-summary" className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <h1
            id="overview-summary"
            className="text-2xl font-semibold tracking-tight"
          >
            Summary
          </h1>
          <DateRangeSelect />
        </div>
        <Separator className="my-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {expenses && income && monthly ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl">
                  {formatCurrency(monthly[0]?.In)}
                </span>
                <h2 className="sm:text-sm text-muted-foreground">
                  Total income
                </h2>
              </div>
              <CategoryBar
                values={income.map(({ amount }) => amount)}
                showLabels={false}
              />
              {income.length > 0 ? (
                <Accordion type="single" collapsible>
                  <AccordionItem className="border-none" value="item-1">
                    <AccordionTrigger className="py-2">
                      More details
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul role="list" className="space-y-2">
                        {income.map(({ name, amount }, index) => (
                          <li
                            key={name}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={cn(
                                `${
                                  chartColors[AvailableChartColors[index]].bg
                                }`,
                                'size-2.5 rounded-sm'
                              )}
                              aria-hidden="true"
                            />
                            <span className="text-gray-900 dark:text-gray-50">
                              {name}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              ({formatCurrency(amount)} /{' '}
                              {((amount / monthly[0].In) * 100).toFixed(1)}
                              %)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl">
                  {formatCurrency(monthly[0]?.Out)}
                </span>
                <h2 className="sm:text-sm text-muted-foreground">
                  Total expenses
                </h2>
              </div>
              <CategoryBar
                values={expenses.map(({ amount }) => amount)}
                colors={expenses.map(
                  ({ categoryName }) => colours[categoryName]
                )}
                showLabels={false}
              />
              {expenses.length > 0 ? (
                <Accordion type="single" collapsible>
                  <AccordionItem className="border-none" value="item-1">
                    <AccordionTrigger className="py-2">
                      More details
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul role="list" className="space-y-2">
                        {expenses.map(
                          ({ category, categoryName, absAmount }) => (
                            <li
                              key={category}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className={cn(
                                  `bg-${colours[categoryName]}`,
                                  'size-2.5 rounded-sm'
                                )}
                                aria-hidden="true"
                              />
                              <span className="text-gray-900 dark:text-gray-50">
                                {categoryName}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                ({formatCurrency(absAmount)} /{' '}
                                {((absAmount / monthly[0].Out) * 100).toFixed(
                                  1
                                )}
                                %)
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </AccordionContent>{' '}
                  </AccordionItem>
                </Accordion>
              ) : null}
            </div>
          </>
        ) : (
          <Skeleton className="sm:col-span-2 h-48 sm:h-[88px]" />
        )}
      </div>
    </section>
  );
};

export default Summary;
