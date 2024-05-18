import IOBar from '@/components/charts/io-bar';
import { Col, Grid, Title } from '@tremor/react';

interface AccountChartsProps {
  accountId: string;
}

const AccountCharts = ({ accountId }: AccountChartsProps) => {
  return (
    <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
      <Col>
        <IOBar accountId={accountId}>
          <Title>Today</Title>
        </IOBar>
      </Col>
      <Col></Col>
    </Grid>
  );
};

export default AccountCharts;
