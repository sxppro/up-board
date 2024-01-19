'use client';

import { FilteredTransactionResource } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate, useTransactions } from '@/utils/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
} from '@tremor/react';
import DashboardCard from '../core/dashboard-card';
import TableSkeleton from '../core/table-skeleton';

const ExpenseTransactions = () => {
  const { date } = useDate();
  const { data, isLoading } = useTransactions(
    date,
    {
      sort: 'time',
      sortDir: 'desc',
    },
    'transactional'
  );

  return (
    <DashboardCard>
      <Title>Transactions</Title>
      {isLoading || !data ? (
        <TableSkeleton cols={2} rows={7} />
      ) : (
        <Table className="w-full flex-1">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(0, 6)
              .map(
                ({
                  id,
                  description,
                  amountRaw,
                }: FilteredTransactionResource) => (
                  <TableRow key={id}>
                    <TableCell className="max-w-[225px] truncate">
                      {description}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(amountRaw)}
                    </TableCell>
                  </TableRow>
                )
              )}
          </TableBody>
        </Table>
      )}
    </DashboardCard>
  );
};

export default ExpenseTransactions;
