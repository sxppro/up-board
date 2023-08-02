'use client';
import { CashIcon, TicketIcon, UserGroupIcon } from '@heroicons/react/solid';
import {
  BadgeDelta,
  Card,
  Color,
  Flex,
  Grid,
  Icon,
  Metric,
  Text,
} from '@tremor/react';

const categories: {
  title: string;
  metric: string;
  icon: any;
  color: Color;
}[] = [
  {
    title: 'Income',
    metric: '$ 23,456,456',
    icon: TicketIcon,
    color: 'indigo',
  },
  {
    title: 'Spending',
    metric: '$ 13,123',
    icon: CashIcon,
    color: 'fuchsia',
  },
  {
    title: 'Transactions',
    metric: '456',
    icon: UserGroupIcon,
    color: 'amber',
  },
];

const MainMetrics = () => {
  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
      {categories.map((item) => (
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
                <BadgeDelta deltaType="moderateIncrease">{'10.2%'}</BadgeDelta>
              </Flex>
              <Metric className="truncate">{item.metric}</Metric>
            </div>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};

export default MainMetrics;
