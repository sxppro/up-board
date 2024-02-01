'use client';

import { FilteredTransactionResource } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { useDate } from '@/utils/hooks';
import { trpc } from '@/utils/trpc';
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

const Payments = () => {
  const { date } = useDate();
  const { data, isLoading } = trpc.user.getTransactionsByDate.useQuery({
    dateRange: { from: date?.from, to: date?.to },
    account: 'transactional',
    type: 'transfers',
    sort: 'time',
    sortDir: 'desc',
  });

  return (
    <DashboardCard>
      <Title>Transfers</Title>
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

export default Payments;
