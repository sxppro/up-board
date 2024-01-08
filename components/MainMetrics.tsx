'use client';

import { MonthlyMetric } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate, useMonthlyMetrics } from '@/utils/hooks';
import { Card, Color, Flex, Grid, Icon, Metric, Text } from '@tremor/react';
import { endOfDay, startOfDay } from 'date-fns';
import { List, Minus, Plus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const currentDate = new Date();

const MainMetrics = () => {
  const { date } = useDate();
  const { data, isLoading } = useMonthlyMetrics(
    date?.from ? date.from : startOfDay(currentDate),
    date?.to ? date.to : endOfDay(currentDate)
  );

  /**
   * Remaps API data into form consumable
   * by component
   * @param param0
   * @returns
   */
  const categories = ({
    Income,
    Expenses,
    Transactions,
  }: MonthlyMetric): {
    title: string;
    metric: string | number | undefined;
    icon: any;
    color: Color;
  }[] => [
    {
      title: 'Income',
      metric: formatCurrency(Income),
      icon: Plus,
      color: 'indigo',
    },
    {
      title: 'Expenses',
      metric: formatCurrency(Expenses),
      icon: Minus,
      color: 'fuchsia',
    },
    {
      title: 'Transactions',
      metric: Transactions,
      icon: List,
      color: 'amber',
    },
  ];

  const parsedCategories = categories(
    Array.isArray(data) && data.length > 0
      ? data[0]
      : {
          Income: 0,
          Expenses: 0,
          Transactions: 0,
        }
  );

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
      {parsedCategories.map((item) => (
        <Card key={item.title} decoration="top" decorationColor={item.color}>
          <Flex justifyContent="start" className="space-x-4">
            <Icon
              icon={item.icon}
              variant="light"
              size="xl"
              color={item.color}
            />
            <div className="truncate flex-1">
              <Flex alignItems="start" justifyContent="between">
                <Text>{item.title}</Text>
              </Flex>
              {isLoading ? (
                <Skeleton className="h-9 max-w-[150px]" />
              ) : (
                <Metric className="truncate">{item.metric}</Metric>
              )}
            </div>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};

export default MainMetrics;
