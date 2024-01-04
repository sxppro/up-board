import type { DateRangeContext } from '@/types/custom';
import { createContext } from 'react';

export const DateContext = createContext<DateRangeContext>({
  date: {
    from: undefined,
    to: undefined,
  },
  setDate: () => {},
});
