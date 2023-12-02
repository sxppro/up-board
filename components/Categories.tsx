'use client';

import { useCategoryMetrics } from '@/utils/fetch';
import { CurrencyCircleDollar, ListNumbers } from '@phosphor-icons/react';
import {
  BarList,
  Bold,
  Card,
  Flex,
  Tab,
  TabGroup,
  TabList,
  Text,
  Title,
} from '@tremor/react';
import { startOfMonth } from 'date-fns';
import { useState } from 'react';
import Loader from './core/Loader';

const categories = [
  { key: 'amount', name: 'Amount', icon: CurrencyCircleDollar },
  { key: 'count', name: 'Count', icon: ListNumbers },
];

// Sorry idk how to type swr yet
const parseData = (data: any) => {
  return {
    amount: sortData(
      data.map(({ category, amount }: any) => ({
        name: category,
        value: amount,
      }))
    ).slice(0, 5),
    count: sortData(
      data.map(({ category, transactions }: any) => ({
        name: category,
        value: transactions,
      }))
    ).slice(0, 5),
  };
};

const sortData = (data: any[]) =>
  data.sort((a, b) => {
    if (a.value < b.value) return 1;
    if (a.value > b.value) return -1;
    return 0;
  });

const currentDate = new Date();

const Categories = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCategory = selectedIndex === 0 ? 'amount' : 'count';

  const { data, isLoading } = useCategoryMetrics(
    startOfMonth(currentDate),
    currentDate
  );

  return (
    <Card className="h-full max-w-md mx-auto flex flex-col">
      <Title>Transaction Categories</Title>
      <TabGroup
        index={selectedIndex}
        onIndexChange={setSelectedIndex}
        className="mt-6"
      >
        <TabList>
          {categories.map((category) => (
            <Tab key={category.key} value={category.key} icon={category.icon}>
              {category.name}
            </Tab>
          ))}
        </TabList>
      </TabGroup>
      <Flex className="mt-6">
        <Text>
          <Bold>Category</Bold>
        </Text>
        <Text>
          <Bold>Amount</Bold>
        </Text>
      </Flex>
      {isLoading ? (
        <Loader />
      ) : (
        <BarList
          data={data && parseData(data)[selectedCategory]}
          showAnimation={false}
          className="mt-4"
        />
      )}
    </Card>
  );
};

export default Categories;
