'use client';

import { CategoryBar } from '@/components/charts/tremor/category-bar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { trpc } from '@/utils/trpc';
import { subDays, subMonths, subYears } from 'date-fns';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface SummaryProps {
  accountId: string;
}

const Summary = ({ accountId }: SummaryProps) => {
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(now, 30),
    to: now,
  });
  const { data: expenses } = trpc.public.getCategoryInfo.useQuery({
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    type: 'parent',
  });
  const { data: income } = trpc.public.getMerchantInfo.useQuery({
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
    type: 'income',
  });
  const { data: monthly } = trpc.public.getMonthlyInfo.useQuery({
    accountId,
    dateRange: {
      from: dateRange?.from,
      to: dateRange?.to,
    },
  });

  const onValueChange = (value: string) => {
    if (value === '24h') {
      setDateRange({ from: subDays(now, 1), to: now });
    } else if (value === '7d') {
      setDateRange({ from: subDays(now, 7), to: now });
    } else if (value === '30d') {
      setDateRange({ from: subDays(now, 30), to: now });
    } else if (value === '3m') {
      setDateRange({ from: subMonths(now, 3), to: now });
    } else if (value === '6m') {
      setDateRange({ from: subMonths(now, 6), to: now });
    } else if (value === '12m') {
      setDateRange({ from: subYears(now, 1), to: now });
    }
  };

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
          <Select
            defaultValue="30d"
            onValueChange={(selection) => onValueChange(selection)}
          >
            <SelectTrigger className="py-0 px-2 sm:py-2 sm:px-3 w-[180px]">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {expenses && income && monthly ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl">
                  {formatCurrency(monthly[0]?.Income)}
                </span>
                <h2 className="sm:text-sm text-muted-foreground">
                  Total income
                </h2>
              </div>
              <CategoryBar
                values={income.map(({ amount }) => amount)}
                showLabels={false}
              />
              <Accordion type="single" collapsible>
                <AccordionItem className="border-none" value="item-1">
                  <AccordionTrigger className="py-2">
                    More details
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul role="list" className="space-y-2">
                      {income.map(({ description, amount }, index) => (
                        <li
                          key={description}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className={cn(
                              `${chartColors[AvailableChartColors[index]].bg}`,
                              'size-2.5 rounded-sm'
                            )}
                            aria-hidden="true"
                          />
                          <span className="text-gray-900 dark:text-gray-50">
                            {description}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            ({formatCurrency(amount)} /{' '}
                            {((amount / monthly[0].Income) * 100).toFixed(1)}
                            %)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl">
                  {formatCurrency(monthly[0]?.Expenses)}
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
              <Accordion type="single" collapsible>
                <AccordionItem className="border-none" value="item-1">
                  <AccordionTrigger className="py-2">
                    More details
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul role="list" className="space-y-2">
                      {expenses.map(({ category, categoryName, amount }) => (
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
                            ({formatCurrency(amount)} /{' '}
                            {((amount / monthly[0].Expenses) * 100).toFixed(1)}
                            %)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>{' '}
                </AccordionItem>
              </Accordion>
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
