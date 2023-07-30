import startOfMonth from 'date-fns/startOfMonth';
import subYears from 'date-fns/subYears';

const transactionsByYear = (date: Date) => {
  const start = subYears(startOfMonth(date), 1);
};

const transactionsByMonth = async (date: Date) => {
  const res = await fetch(
    `https://api.up.com.au/api/v1/accounts/${process.env.TRANSACTION_ACC}/transactions`,
    { headers: { Authorization: process.env.UP_TOKEN || '' } }
  );
  if (!res.ok) {
    return null;
  } else {
    console.log(res.body);
  }
  return startOfMonth(date);
};

export { transactionsByMonth, transactionsByYear };
