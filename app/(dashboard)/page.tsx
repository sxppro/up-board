import BasicDashboard from '@/components/BasicDashboard';
import { authOptions } from '@/utils/auth';
import { getServerSession } from 'next-auth';

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);

  return <BasicDashboard />;
};

export default DashboardPage;
