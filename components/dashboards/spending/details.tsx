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
import { CircleNotch, Minus, Plus } from '@phosphor-icons/react';
import { BarList, Card } from '@tremor/react';

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
  const { data: selectedSubcategory } = trpc.public.getCategoryInfo.useQuery(
    {
      dateRange: date || {},
      type: 'child',
      options: {},
      parentCategory: selectedCategory?.id,
    },
    { enabled: !!selectedCategory }
  );
  // Split selectedSubcategory into money in and money out
  const selectedSubcategoryIn = selectedSubcategory?.filter(
    ({ amount }) => amount > 0
  );
  const selectedSubcategoryOut = selectedSubcategory?.filter(
    ({ amount }) => amount < 0
  );

  return selectedCategory ? (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Subcategories</h2>
        {selectedSubcategory ? (
          selectedSubcategoryIn && selectedSubcategoryOut ? (
            <>
              {selectedSubcategoryIn.length > 0 && (
                <Card className="ring-border bg-background p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Plus className="size-4" />
                    <h3>Money In</h3>
                  </div>
                  <BarList
                    data={selectedSubcategoryIn.map(
                      ({ categoryName, absAmount }) => ({
                        name: categoryName,
                        value: absAmount,
                      })
                    )}
                    color={`up-${selectedCategory.id}`}
                    valueFormatter={formatCurrency}
                    showAnimation
                  />
                </Card>
              )}
              {selectedSubcategoryOut.length > 0 && (
                <Card className="ring-border bg-background p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Minus className="size-4" />
                    <h3>Money Out</h3>
                  </div>
                  <BarList
                    data={selectedSubcategoryOut.map(
                      ({ categoryName, absAmount }) => ({
                        name: categoryName,
                        value: absAmount,
                      })
                    )}
                    color={`up-${selectedCategory.id}`}
                    valueFormatter={formatCurrency}
                    showAnimation
                  />
                </Card>
              )}
            </>
          ) : (
            ''
          )
        ) : (
          <div className="flex flex-col gap-1">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-[160px] h-8" />
            <Skeleton className="w-[120px] h-8" />
          </div>
        )}
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
            <AccordionItem
              key={category}
              value={category}
              disabled={categoryName === 'Uncategorised'}
            >
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
