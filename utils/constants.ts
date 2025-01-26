import { TZDate } from '@date-fns/tz';

export const colours: { [key: string]: string } = {
  'Good Life': 'up-good-life',
  Home: 'up-home',
  Personal: 'up-personal',
  Transport: 'up-transport',
  Uncategorised: 'up-uncategorised',
};

export const DAYS_IN_ONE_YEAR = 365;

export const MONTHS_IN_ONE_YEAR = 12;

export const YEARS_IN_ONE_DECADE = 10;

export const DB_NAME = 'up';

export const TZ = 'Australia/Melbourne';

export const now = TZDate.tz(TZ);

export const CachePresets = {
  FIVE_MINUTES_IN_MS: 5 * 60 * 1000,
  ONE_DAY_IN_SECONDS: 60 * 60 * 24,
};
