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
import TableSkeleton from '../TableSkeleton';
import DashboardCard from '../core/dashboard-card';

const ExpenseTransactions = () => {
  const { date } = useDate();
  const { data, isLoading } = useTransactions(
    date?.from,
    date?.to,
    'time',
    'desc'
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
                    <TableCell>{description}</TableCell>
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
