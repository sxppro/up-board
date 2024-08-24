import CategoryInsightsGroup from '@/components/charts/category-insights-group';
import ExpenseCategoriesBarList from '@/components/charts/expense-categories-bar-list';
import IOBar from '@/components/charts/io-bar';
import DashboardCard from '@/components/core/dashboard-card';
import TableSkeleton from '@/components/core/table-skeleton';
import TransactionCard from '@/components/tables/transaction-card';
import { Col, Grid, Title } from '@tremor/react';
import { Suspense } from 'react';
import { AccountChartsProps } from './charts';

const TransactionalCharts = ({
  accountId,
  start,
  end,
}: Omit<AccountChartsProps, 'accountType'>) => {
  return (
    <>
      <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
        <Col>
          <Suspense
            fallback={
              <DashboardCard>
                <Title>Income</Title>
                <TableSkeleton cols={2} rows={6} />
              </DashboardCard>
            }
          >
            <TransactionCard
              title="Income"
              start={start}
              end={end}
              options={{
                transactionType: 'transactions',
                type: 'income',
                limit: 5,
              }}
            />
          </Suspense>
        </Col>
        <Col>
          <ExpenseCategoriesBarList />
        </Col>
        <Col>
          <IOBar accountId={accountId}>
            <Title>Today</Title>
          </IOBar>
        </Col>
      </Grid>
      <CategoryInsightsGroup />
    </>
  );
};

export default TransactionalCharts;
