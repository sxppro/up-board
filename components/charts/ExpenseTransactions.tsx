import {
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
} from '@tremor/react';

const ExpenseTransactions = () => {
  return (
    <Card>
      <Title>Expenses</Title>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    </Card>
  );
};

export default ExpenseTransactions;
