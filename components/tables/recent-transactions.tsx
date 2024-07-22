'use client';

import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
import {
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react';
import DashboardCard from '../core/dashboard-card';
import TableSkeleton from '../core/table-skeleton';

const RecentTransactions = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getTransactionsByDate.useQuery({
    dateRange: { from: date?.from, to: date?.to },
    account: 'transactional',
    transactionType: 'transactions',
    sort: 'time',
    sortDir: 'desc',
    limit: 6,
  });

  return (
    <DashboardCard>
      <Title>Transactions</Title>
      {isLoading || !data ? (
        <TableSkeleton cols={2} rows={7} />
      ) : data.length > 0 ? (
        <Table className="w-full flex-1">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ id, description, amountRaw }) => (
              <TableRow key={id}>
                <TableCell className="max-w-[225px] truncate">
                  {description}
                </TableCell>
                <TableCell className="text-end">
                  {formatCurrency(amountRaw)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Flex className="justify-center items-center w-full h-full border border-dashed rounded-tremor-default border-tremor-border dark:border-dark-tremor-border">
          <Text>No transactions</Text>
        </Flex>
      )}
    </DashboardCard>
  );
};

export default RecentTransactions;
