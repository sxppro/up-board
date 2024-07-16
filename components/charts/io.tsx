import { getMonthlyInfo } from '@/db';
import { DateRangeProps } from '@/types/custom';
import { formatCurrency } from '@/utils/helpers';
import { startOfMonth } from 'date-fns';
import { ChevronDown, ChevronUp, Ellipsis, Minus, Plus } from 'lucide-react';
import StatCard from '../core/stat-card';

interface IOProps extends DateRangeProps {
  accountId: string;
}

const IO = async ({ accountId, start, end }: IOProps) => {
  const now = new Date();
  const stats = (
    await getMonthlyInfo(accountId, {
      from: start || startOfMonth(now),
      to: end || now,
    })
  )[0];
  const netColour = stats?.Net ? (stats.Net < 0 ? 'rose' : 'green') : 'zinc';

  return (
    <>
      <StatCard
        info={{
          title: 'In',
          metric: formatCurrency(stats?.Income || 0),
          color: 'indigo',
        }}
      >
        {/* Replicate tremor icon */}
        <span className="tremor-Icon-root inline-flex flex-shrink-0 items-center bg-indigo-500 bg-opacity-20 text-indigo-500 rounded-tremor-default px-2.5 py-2.5">
          <Plus className="tremor-Icon-icon shrink-0 h-9 w-9" />
        </span>
      </StatCard>
      <StatCard
        info={{
          title: 'Out',
          metric: formatCurrency(stats?.Expenses || 0),
          color: 'fuchsia',
        }}
      >
        <span className="tremor-Icon-root inline-flex flex-shrink-0 items-center bg-fuchsia-500 bg-opacity-20 text-fuchsia-500 rounded-tremor-default px-2.5 py-2.5">
          <Minus className="tremor-Icon-icon shrink-0 h-9 w-9" />
        </span>
      </StatCard>
      <StatCard
        info={{
          title: 'Net',
          metric: formatCurrency(stats?.Net || 0),
          color: netColour,
        }}
      >
        <span
          className={`tremor-Icon-root inline-flex flex-shrink-0 items-center bg-${netColour}-500 bg-opacity-20 text-${netColour}-500 rounded-tremor-default px-2.5 py-2.5`}
        >
          {stats?.Net ? (
            stats.Net < 0 ? (
              <ChevronDown className="tremor-Icon-icon shrink-0 h-9 w-9" />
            ) : (
              <ChevronUp className="tremor-Icon-icon shrink-0 h-9 w-9" />
            )
          ) : (
            <Ellipsis className="tremor-Icon-icon shrink-0 h-9 w-9" />
          )}
        </span>
      </StatCard>
    </>
  );
};

export default IO;
