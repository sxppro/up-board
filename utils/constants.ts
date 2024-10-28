import { TZDate } from '@date-fns/tz';
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subYears,
} from 'date-fns';

export const colours: { [key: string]: string } = {
  'Good Life': 'up-good-life',
  Home: 'up-home',
  Personal: 'up-personal',
  Transport: 'up-transport',
  Uncategorised: 'up-uncategorised',
};

export const TZ = 'Australia/Melbourne';

export const now = TZDate.tz(TZ);

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

  return {
    thisMonth,
    thisYear,
    thisMonthLastYear,
    lastYear,
    monthToDate,
    yearToDate,
  };
};
