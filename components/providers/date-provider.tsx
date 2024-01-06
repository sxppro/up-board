'use client';

import { DateContext } from '@/utils/contexts';
import { startOfMonth } from 'date-fns';
import { PropsWithChildren, useState } from 'react';
import { DateRange } from 'react-day-picker';

const DateProvider = ({ children }: PropsWithChildren) => {
  const currentDate = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(currentDate),
    to: currentDate,
  });

  return (
    <DateContext.Provider value={{ date, setDate }}>
      {children}
    </DateContext.Provider>
  );
};

export default DateProvider;
