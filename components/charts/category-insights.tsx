'use client';

import { DateRangeProps } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import {
  BarList,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Title,
} from '@tremor/react';
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
  const { data: rawData, isError } = trpc.user.getCategoryInfo.useQuery({
    dateRange: {
      from: start || date?.from,
      to: end || date?.to,
    },
    type: 'child',
    parentCategory: category,
  });
  const data = isError
    ? []
    : rawData
    ? rawData.map(({ category, amount }) => ({
        name: category,
        value: amount,
        color: `up-${category}`,
      }))
    : [];
  console.log(data);

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
              className={`overflow-hidden ${extended ? '' : 'max-h-[260px]'}`}
            >
              <BarList
                data={data}
                valueFormatter={(number: number) =>
                  formatCurrency(number, true)
                }
              />
            </div>

            {data.length > 7 ? (
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
        </TabPanels>
      </TabGroup>
    </DashboardCard>
  );
};

export default CategoryInsights;
