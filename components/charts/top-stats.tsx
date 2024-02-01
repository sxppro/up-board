'use client';

import { AccountMonthlyInfo } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import { Card, Color, Flex, Grid, Icon, Metric, Text } from '@tremor/react';
import { List, Minus, Plus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const TopStats = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getMonthlyInfo.useQuery({
    from: date?.from,
    to: date?.to,
  });

  /**
   * Remaps data to shape consumable by component
   * @param param0
   * @returns
   */
  const categories = ({
    Income,
    Expenses,
    Transactions,
  }: AccountMonthlyInfo): {
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
      ? data.reduce((prev, current) => {
          return {
            Income: prev.Income + current.Income,
            Expenses: prev.Expenses + current.Expenses,
            Transactions: prev.Transactions + current.Transactions,
            Year: 0,
            Month: 0,
            Day: undefined,
          };
        })
      : {
          Income: 0,
          Expenses: 0,
          Transactions: 0,
          Year: 0,
          Month: 0,
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

export default TopStats;
