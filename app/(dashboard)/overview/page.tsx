import OverviewDashboard from '@/components/dashboards/overview';
import QueryProvider from '@/components/providers/query-provider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Overview',
};

const DashboardPage = () => {
  return (
    <QueryProvider>
      <OverviewDashboard />
    </QueryProvider>
  );
};

export default DashboardPage;
