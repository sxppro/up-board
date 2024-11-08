'use client';

import TransactionsList from '@/components/tables/transactions-list';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/tremor/accordion';
import {
  TransactionCategoryInfo,
  TransactionCategoryOption,
} from '@/server/schemas';
import { cn, formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { CircleNotch } from '@phosphor-icons/react';

interface SpendingDetailsProps {
  categoryStats: TransactionCategoryInfo[];
  subCategoryStats: TransactionCategoryInfo[][];
  selectedCategory?: TransactionCategoryOption;
}

const SpendingDetails = ({
  categoryStats,
  subCategoryStats,
  selectedCategory,
}: SpendingDetailsProps) => {
  const { date } = useDate();
  const { data, isError } = trpc.public.getTransactionsByDay.useQuery(
    {
      dateRange: date,
      options: {
        match: {
          'relationships.parentCategory.data.id': selectedCategory?.id || '',
        },
      },
    },
    { enabled: !!selectedCategory }
  );

  return selectedCategory ? (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <h2 className="text-lg font-semibold">Subcategories</h2>
      </div>
      <div className="flex flex-col">
        {data ? (
          <TransactionsList transactions={data} />
        ) : isError ? (
          <p className="text-muted-foreground">
            Failed to retrieve transactions.
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <Skeleton className="w-40 h-7 self-start" />
            <Separator />
            <div className="flex items-center gap-1">
              <CircleNotch className="size-4 animate-spin" />
              <p>Retrieving transactions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
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
  );
};

export default SpendingDetails;
