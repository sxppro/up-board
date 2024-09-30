'use client';

import { DateRangeProps } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import {
  BarChart,
  BarList,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Title,
} from '@tremor/react';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { useState } from 'react';
import DashboardCard from '../core/dashboard-card';

type CategoryInsightsProps = {
  category: string;
  categoryName: string;
} & DateRangeProps;

const CategoryInsights = ({
  category,
  categoryName,
  start,
  end,
}: CategoryInsightsProps) => {
  const { date } = useDate();
  const [extended, setExtended] = useState(false);
  const { data: rawCategoryData, isSuccess } =
    trpc.public.getCategoryInfo.useQuery({
      dateRange: {
        from: start || date?.from,
        to: end || date?.to,
      },
      type: 'child',
      parentCategory: category,
    });
  // Last 12 months of category history
  const { data: historyData } = trpc.public.getCategoryInfoHistory.useQuery({
    dateRange: {
      // Subtract 12 months
      from: start || (date?.from && startOfMonth(subMonths(date?.from, 12))),
      // End of previous month
      to: end || (date?.from && endOfMonth(subMonths(date?.from, 1))),
    },
    type: 'parent',
  });
  const subcategoryData =
    isSuccess && rawCategoryData
      ? rawCategoryData.map(({ categoryName, amount }) => ({
          name: categoryName,
          value: amount,
          color: `up-${category}`,
        }))
      : [];

  return (
    <DashboardCard>
      <Title>{categoryName}</Title>
      <TabGroup className="w-full h-full">
        <TabList>
          <Tab>Sub-categories</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div
              className={`overflow-hidden ${extended ? '' : 'h-60 sm:h-80'}`}
            >
              <BarList
                data={subcategoryData}
                valueFormatter={(number: number) =>
                  formatCurrency(number, true)
                }
                showAnimation
              />
            </div>

            {subcategoryData.length > 7 ? (
              <div
                className={`flex justify-center ${
                  extended
                    ? 'px-6'
                    : 'absolute inset-x-0 bottom-0 rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background'
                }`}
              >
                <button
                  className="flex items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background px-2.5 py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
                  onClick={() => setExtended(!extended)}
                >
                  {extended ? 'Show less' : 'Show more'}
                </button>
              </div>
            ) : (
              ''
            )}
          </TabPanel>
          <TabPanel>
            <BarChart
              className="h-60 sm:h-80"
              data={historyData || []}
              index={'FormattedDate'}
              categories={[categoryName]}
              colors={[`up-${category}`]}
              valueFormatter={(number: number) => formatCurrency(number, false)}
              showLegend={false}
              showAnimation
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </DashboardCard>
  );
};

export default CategoryInsights;
