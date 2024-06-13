import IOBar from '@/components/charts/io-bar';
import DashboardCard from '@/components/core/dashboard-card';
import { Col, Grid, Text, Title } from '@tremor/react';

interface AccountChartsProps {
  accountId: string;
}

const AccountCharts = ({ accountId }: AccountChartsProps) => {
  return (
    <>
      <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
        <Col>
          <DashboardCard>
            <Text>
              Income tx + show more button that takes u to
              /transactions?accountId=... OR dialog of filtered transactions (by
              acc, income, date range)
            </Text>
          </DashboardCard>
        </Col>
        <Col>
          <DashboardCard>
            <Text>Expenses tx</Text>
          </DashboardCard>
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
