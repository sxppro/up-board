'use client';

import { TagInfo } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { Color, Grid } from '@tremor/react';
import { List, Minus, Plus } from 'lucide-react';
import StatCard from '../core/stat-card';

interface TagDashboardProps {
  tag: string;
}

const TagDashboard = ({ tag }: TagDashboardProps) => {
  const { data: tagInfo, isLoading } = trpc.user.getTagInfo.useQuery(tag);
  const parse = ({
    Income,
    Expenses,
    Transactions,
  }: TagInfo): {
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
  const parsedTagInfo =
    tagInfo &&
    Array.isArray(tagInfo) &&
    tagInfo.length > 0 &&
    parse(tagInfo[0]);

  return (
    <div className="w-full">
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
        {parsedTagInfo &&
          parsedTagInfo.map((item) => (
            <StatCard key={item.title} info={{ ...item, isLoading }} />
          ))}
      </Grid>
    </div>
  );
};

export default TagDashboard;
