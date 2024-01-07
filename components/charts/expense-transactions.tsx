'use client';

import {
  Table,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
} from '@tremor/react';
import DashboardCard from '../core/dashboard-card';

const ExpenseTransactions = () => {
  return (
    <DashboardCard>
      <Title>Expenses</Title>
      <Table className="w-full">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    </DashboardCard>
  );
};

export default ExpenseTransactions;
