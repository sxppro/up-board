import DashboardCard from '@/components/core/dashboard-card';
import { getTransactions } from '@/db/helpers';
import { TransactionRetrievalOptions } from '@/server/schemas';
import { formatCurrency } from '@/utils/helpers';
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

type TransactionCardProps = {
  title: string;
  options: Partial<TransactionRetrievalOptions>;
};

/**
 * Dashboard card for displaying a glimpse
 * of transactions
 * @returns
 */
const TransactionCard = async ({ title, options }: TransactionCardProps) => {
  const { account, transactionType, sort, sortDir, limit } = options;
  const transactions = await getTransactions({
    dateRange: { from: new Date('2024-03-01'), to: new Date() },
    account: account || 'transactional',
    transactionType: transactionType || 'transactions',
    sort: sort || 'time',
    sortDir: sortDir || 'desc',
    limit: limit || 6,
  });

  return (
    <DashboardCard>
      <Title>{title}</Title>
      {transactions && transactions.length > 0 ? (
        <Table className="w-full flex-1">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(({ id, description, amountRaw }) => (
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

export default TransactionCard;
