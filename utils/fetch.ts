import { endOfMonth } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import subYears from 'date-fns/subYears';

const getTransactionsByYear = async (date: Date) => {
  const MONTHS_IN_YEAR = 12;
  let currentDate = subYears(date, 1);

  for (let i = 0; i < MONTHS_IN_YEAR; i++) {
    // TODO: fetch for each month up to current month
    try {
      const data = await getTransactionsByMonth(currentDate);
    } catch (err) {
      console.error(err);
    }
  }
};

const getTransactionsByMonth = async (date: Date) => {
  const res = await fetch(
    '/api/transactions?' +
      new URLSearchParams({
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      })
  );
  if (res.ok) {
    return await res.json();
  } else {
    throw new Error(`${res.status} — ${res.statusText}`);
  }
};

export { getTransactionsByMonth, getTransactionsByYear };
