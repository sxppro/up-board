'use client';

import ExpenseCategoriesBar from '@/components/charts/expense-categories-bar';
import { IO_OPTIONS } from '@/utils/constants';
import { Tab, TabGroup, TabList, Title } from '@tremor/react';
import { useState } from 'react';

const TransactionsByHour = ({ data }: { data: any[] }) => {
  const [category, setCategory] = useState(IO_OPTIONS.IN);
  return (
    <section
      aria-label="Transactions by time of day"
      className="h-full border rounded-tremor-default flex flex-col gap-4 p-4 xl:col-span-2"
    >
      <Title>Transactions by Time of Day</Title>
      <TabGroup
        onIndexChange={(index) => setCategory(Object.values(IO_OPTIONS)[index])}
      >
        <TabList variant="solid">
          <Tab value="In">Money In</Tab>
          <Tab value="Out">Money Out</Tab>
        </TabList>
      </TabGroup>
      <ExpenseCategoriesBar
        className="h-64"
        data={data}
        categories={[category]}
        colors={[category === IO_OPTIONS.IN ? 'indigo' : 'fuchsia']}
        index="Hour"
        showLegend={false}
      />
    </section>
  );
};

export default TransactionsByHour;
