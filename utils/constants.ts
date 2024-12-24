import { DateRangePresets } from '@/types/custom';
import { TZDate } from '@date-fns/tz';
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

export const colours: { [key: string]: string } = {
  'Good Life': 'up-good-life',
  Home: 'up-home',
  Personal: 'up-personal',
  Transport: 'up-transport',
  Uncategorised: 'up-uncategorised',
};

export const DB_NAME = 'up';

export const TZ = 'Australia/Melbourne';

export const now = TZDate.tz(TZ);

export const CachePresets = {
  FIVE_MINUTES_IN_MS: 5 * 60 * 1000,
  ONE_DAY_IN_SECONDS: 60 * 60 * 24,
};

/**
 * Utility date ranges
 * @returns
 */
export const getDateRanges = () => {
  const thisMonth = {
    from: startOfMonth(now),
    to: endOfMonth(now),
  };

  const thisMonthLastYear = {
    from: subYears(thisMonth.from, 1),
    to: subYears(thisMonth.to, 1),
  };

  const thisYear = {
    from: startOfYear(now),
    to: endOfYear(now),
  };

  const lastYear = {
    from: subYears(thisYear.from, 1),
    to: subYears(thisYear.to, 1),
  };

  const monthToDate = {
    from: startOfMonth(now),
    to: now,
  };

  const yearToDate = {
    from: startOfYear(now),
    to: now,
  };

  const last24hours = {
    from: subDays(now, 1),
    to: now,
  };

  const last7days = {
    from: subDays(now, 7),
    to: now,
  };

  const last30days = {
    from: subDays(now, 30),
    to: now,
  };

  const last3months = {
    from: subMonths(now, 3),
    to: now,
  };

  const last6months = {
    from: subMonths(now, 6),
    to: now,
  };

  const last12months = {
    from: subYears(now, 1),
    to: now,
  };

  return {
    thisMonth,
    thisYear,
    thisMonthLastYear,
    lastYear,
    monthToDate,
    yearToDate,
    map: new Map(
      Object.entries({
        [DateRangePresets.TODAY]: last24hours,
        [DateRangePresets.WEEK]: last7days,
        [DateRangePresets.MONTH]: last30days,
        [DateRangePresets.THREE_MONTHS]: last3months,
        [DateRangePresets.SIX_MONTHS]: last6months,
        [DateRangePresets.YEAR]: last12months,
      })
    ),
  };
};
