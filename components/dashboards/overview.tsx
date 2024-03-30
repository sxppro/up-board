import { Col, Grid } from '@tremor/react';
import AccountBalanceHistoricalArea from '../charts/account-balance-historical-area';
import ExpenseCategoriesDonut from '../charts/expense-categories-donut';
import MonthlyInOut from '../charts/monthly-in-out';
import TopStats from '../charts/top-stats';
import DateRangePicker from '../core/date-range-picker';
import DateProvider from '../providers/date-provider';
import Payments from '../tables/payments';
import RecentTransactions from '../tables/recent-transactions';

const OverviewDashboard = () => {
  return (
    <DateProvider>
      <div className="w-full flex flex-col md:flex-row justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <DateRangePicker />
      </div>
      <div className="w-full">
        <TopStats />
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
          <Col numColSpanMd={2} numColSpanLg={1}>
            <AccountBalanceHistoricalArea />
          </Col>
          <Col numColSpanMd={1}>
            <ExpenseCategoriesDonut />
          </Col>
          <Col numColSpanMd={1}>
            <RecentTransactions />
          </Col>
        </Grid>
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
          <Col numColSpanMd={1} numColSpanLg={2}>
            <MonthlyInOut />
          </Col>
          <Col numColSpanMd={1}>
            <Payments />
          </Col>
        </Grid>
      </div>
    </DateProvider>
  );
};

export default OverviewDashboard;
