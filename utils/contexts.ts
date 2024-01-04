import type { DateRangeContext } from '@/types/custom';
import { createContext } from 'react';

export const DateContext = createContext<DateRangeContext>({
  date: undefined,
  setDate: () => {},
});
