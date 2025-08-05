import PeriodInReview from '@/components/dashboards/history/period-in-review';
import { getAccounts } from '@/db';
import { DateRange } from '@/server/schemas';
import { now } from '@/utils/constants';
import { TZDate } from '@date-fns/tz';

const AllTimeHistoryPage = async () => {
  const accountCreationDate = (await getAccounts()).reduce(
    (earliest, account) => {
      const createdAt = new TZDate(account.createdAt);
      return createdAt < earliest ? createdAt : earliest;
    },
    now
  );
  const allTimeRange: DateRange = {
    from: accountCreationDate,
    to: now,
  };

  return (
    <PeriodInReview dateRange={allTimeRange}>
      <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
        All Time
      </h1>
    </PeriodInReview>
  );
};

export default AllTimeHistoryPage;
