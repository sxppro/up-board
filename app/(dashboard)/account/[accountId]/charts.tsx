import IOBar from '@/components/charts/io-bar';
import DateProvider from '@/components/providers/date-provider';
import QueryProvider from '@/components/providers/query-provider';
import { Col, Grid, Title } from '@tremor/react';

interface AccountChartsProps {
  accountId: string;
}

const AccountCharts = ({ accountId }: AccountChartsProps) => {
  return (
    <QueryProvider>
      <DateProvider>
        <Grid numItemsMd={2} numItemsLg={3} className="gap-4">
          <Col>
            <IOBar
              accountId={accountId}
              // start={startDate ? new Date(startDate) : undefined}
              // end={endDate ? new Date(endDate) : undefined}
            >
              <Title>Today</Title>
            </IOBar>
          </Col>
          <Col></Col>
        </Grid>
      </DateProvider>
    </QueryProvider>
  );
};

export default AccountCharts;
