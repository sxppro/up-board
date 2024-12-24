import { TZDate } from '@date-fns/tz';

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
