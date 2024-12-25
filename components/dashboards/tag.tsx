'use client';

import { TagInfo } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { Color, Grid } from '@tremor/react';
import StatCard from '../core/stat-card';

interface TagDashboardProps {
  tagInfo: TagInfo;
}

const TagDashboard = ({ tagInfo }: TagDashboardProps) => {
  const { Income, Expenses, Transactions } = tagInfo;
  const parsedTagInfo: {
    title: string;
    metric: string | number | undefined;
    color: Color;
  }[] = [
    {
      title: 'Money In',
      metric: formatCurrency(Income),
      color: 'indigo',
    },
    {
      title: 'Money Out',
      metric: formatCurrency(Expenses),
      color: 'fuchsia',
    },
    {
      title: 'Transactions',
      metric: Transactions,
      color: 'amber',
    },
  ];

  return (
    <div className="w-full">
      <Grid numItemsSm={2} numItemsLg={3} className="gap-3 my-2">
        {parsedTagInfo &&
          parsedTagInfo.map((item) => {
            return <StatCard key={item.title} info={{ ...item }} />;
          })}
      </Grid>
    </div>
  );
};

export default TagDashboard;
