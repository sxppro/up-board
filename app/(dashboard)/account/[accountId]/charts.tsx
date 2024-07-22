import ExpenseCategoriesBarList from '@/components/charts/expense-categories-bar-list';
import IOBar from '@/components/charts/io-bar';
import DashboardCard from '@/components/core/dashboard-card';
import TableSkeleton from '@/components/core/table-skeleton';
import TransactionCard from '@/components/tables/transaction-card';
import { Col, Grid, Text, Title } from '@tremor/react';
import { Suspense } from 'react';

interface AccountChartsProps {
  accountId: string;
}

const AccountCharts = ({ accountId }: AccountChartsProps) => {
  return (
    <>
      <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
        <Col>
          <Suspense
            fallback={
              <DashboardCard>
                <Title>test</Title>
                <TableSkeleton cols={2} rows={6} />
              </DashboardCard>
            }
          >
            <TransactionCard
              title="Income"
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
      <Grid numItemsMd={2} className="gap-4">
        <Col>
          <DashboardCard>
            <Text>Good Life</Text>
          </DashboardCard>
        </Col>
        <Col>
          <DashboardCard>
            <Text>Personal</Text>
          </DashboardCard>
        </Col>
        <Col>
          <DashboardCard>
            <Text>Home</Text>
          </DashboardCard>
        </Col>
        <Col>
          <DashboardCard>
            <Text>Transport</Text>
          </DashboardCard>
        </Col>
      </Grid>
    </>
  );
};

export default AccountCharts;
