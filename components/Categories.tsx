import { useState } from 'react';

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

import { CodeIcon, TableIcon } from '@heroicons/react/solid';

const categories = [
  { key: 'developers', name: 'Developers', icon: CodeIcon },
  { key: 'analysts', name: 'Analysts', icon: TableIcon },
];

const developerVisits = [
  { name: '/home', value: 652 },
  { name: '/about', value: 134 },
  { name: '/docs', value: 542 },
  { name: '/tempates', value: 234 },
  { name: '/terms', value: 12 },
];

const analystVisits = [
  { name: '/home', value: 456 },
  { name: '/about', value: 271 },
  { name: '/docs', value: 46 },
  { name: '/templates', value: 191 },
  { name: '/terms', value: 82 },
  { name: '/refund', value: 15 },
];

const visits: { [key: string]: any } = {
  developers: developerVisits,
  analysts: analystVisits,
};

const sortData = (data: any[]) =>
  data.sort((a, b) => {
    if (a.value < b.value) return 1;
    if (a.value > b.value) return -1;
    return 0;
  });

const Categories = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCategory = selectedIndex === 0 ? 'developers' : 'analysts';

  return (
    <Card className="max-w-md h-full mx-auto">
      <Title>Page Visits by Audience</Title>
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
          <Bold>Site</Bold>
        </Text>
        <Text>
          <Bold>Visits</Bold>
        </Text>
      </Flex>
      <BarList
        data={sortData(visits[selectedCategory])}
        showAnimation={false}
        className="mt-4"
      />
    </Card>
  );
};

export default Categories;
