import { TZDate } from '@date-fns/tz';

export const colours: { [key: string]: string } = {
  'Good Life': 'up-good-life',
  Home: 'up-home',
  Personal: 'up-personal',
  Transport: 'up-transport',
  Uncategorised: 'up-uncategorised',
};

export const TZ = 'Australia/Melbourne';

export const now = TZDate.tz(TZ);
