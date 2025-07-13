import PeriodInReview from '@/components/dashboards/history/period-in-review';
import { getDateRanges } from '@/utils/helpers';
import { endOfMonth, endOfYear, parse } from 'date-fns';

const HistoryPage = ({ params }: { params: { date: string } }) => {
  const { date } = params;
  const dateStr = decodeURIComponent(date);
  const { thisYear } = getDateRanges();

  const year = parse(dateStr, 'yyyy', thisYear.from);

  if (isNaN(year.getTime())) {
    const monthYear = parse(dateStr, 'MMM-yyyy', thisYear.from);

    if (isNaN(monthYear.getTime())) {
      return <div>Error: Invalid date format.</div>;
    } else {
      const monthRange = { from: monthYear, to: endOfMonth(monthYear) };
      return (
        <PeriodInReview dateRange={monthRange}>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight pt-8 sm:pt-24">
            {monthYear.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h1>
        </PeriodInReview>
      );
    }
  } else {
    // Year
    const yearRange = { from: year, to: endOfYear(year) };
    return (
      <PeriodInReview dateRange={yearRange}>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight pt-8 sm:pt-24">
          {year.toLocaleString('default', {
            year: 'numeric',
          })}
        </h1>
      </PeriodInReview>
    );
  }
};

export default HistoryPage;
