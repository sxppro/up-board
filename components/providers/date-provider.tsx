'use client';

import { DateContext } from '@/utils/contexts';
import { startOfMonth } from 'date-fns';
import { PropsWithChildren, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

const DateProvider = ({ children }: PropsWithChildren) => {
  const currentDate = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(currentDate),
    to: currentDate,
  });
  const dateContext = useMemo(() => ({ date, setDate }), [date]);

  return (
    <DateContext.Provider value={dateContext}>{children}</DateContext.Provider>
  );
};

export default DateProvider;
