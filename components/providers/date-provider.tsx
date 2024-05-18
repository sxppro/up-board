'use client';

import { DateRangeProps } from '@/types/custom';
import { DateContext } from '@/utils/contexts';
import { startOfMonth } from 'date-fns';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

const DateProvider = ({
  children,
  start,
  end,
}: PropsWithChildren & DateRangeProps) => {
  const currentDate = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: start || startOfMonth(currentDate),
    to: end || currentDate,
  });
  const dateContext = useMemo(() => ({ date, setDate }), [date]);

  useEffect(() => setDate({ from: start, to: end }), [start, end]);

  return (
    <DateContext.Provider value={dateContext}>{children}</DateContext.Provider>
  );
};

export default DateProvider;
