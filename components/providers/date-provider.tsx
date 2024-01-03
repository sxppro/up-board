'use client';

import { startOfMonth } from 'date-fns';
import { PropsWithChildren, createContext, useState } from 'react';
import { DateRange } from 'react-day-picker';

type DateContext = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
};

const DateContext = createContext<DateContext>({
  date: undefined,
  setDate: () => {},
});

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
