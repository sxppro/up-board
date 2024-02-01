'use client';

import { TransactionCategoryInfo } from '@/server/schemas';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
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
import { useState } from 'react';
import Loader from '../core/loader';

const categories = [
  { key: 'amount', name: 'Amount', icon: CurrencyCircleDollar },
  { key: 'count', name: 'Count', icon: ListNumbers },
];

const parseData = (data: TransactionCategoryInfo[]) => {
  return {
    amount: sortData(
      data.map(({ category, amount }) => ({
        name: category,
        value: amount,
      }))
    ).slice(0, 5),
    count: sortData(
      data.map(({ category, transactions }) => ({
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

const ExpenseCategoriesBar = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getCategoryInfo.useQuery({
    dateRange: {
      from: date?.from,
      to: date?.to,
    },
    type: 'child',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCategory = selectedIndex === 0 ? 'amount' : 'count';

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
          data={(data && parseData(data)[selectedCategory]) || []}
          showAnimation={false}
          className="mt-4"
        />
      )}
    </Card>
  );
};

export default ExpenseCategoriesBar;
