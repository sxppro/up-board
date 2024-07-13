'use client';

import { DateRangeProps } from '@/types/custom';
import { DateContext } from '@/utils/contexts';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

const DateProvider = ({
  children,
  start,
  end,
}: PropsWithChildren & DateRangeProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: start,
    to: end,
  });
  const dateContext = useMemo(() => ({ date, setDate }), [date]);

  useEffect(() => setDate({ from: start, to: end }), [start, end]);

  return (
    <DateContext.Provider value={dateContext}>{children}</DateContext.Provider>
  );
};

export default DateProvider;
