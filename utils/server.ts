/**
 * Server-side data fetching
 */

import { insertTransactions } from '@/db';
import { paths } from '@/types/up-api';
import createClient from 'openapi-fetch';
import { filterTransactionFields } from './helpers';

const { GET: upGET } = createClient<paths>({
  baseUrl: 'https://api.up.com.au/api/v1',
});

/**
 * Retrieves next page according to Up API pagination
 * @see https://developer.up.com.au/#accounts
 * @param link next page link
 * @param store array to concat results
 * @returns current page and subsequent pages (if there are any)
 */
const getNextPage = async (link: string, store = []): Promise<never[]> => {
  const res = await fetch(link, {
    headers: { Authorization: `Bearer ${process.env.UP_TOKEN}` },
  });
  console.log(res.status);
  const data = await res.json();

  if (res.ok && data?.links?.next) {
    return store.concat(await getNextPage(data.links.next, data?.data));
  } else if (data?.data) {
    return store.concat(data.data);
  } else {
    return store.concat(data);
  }
};

/**
 * Retrieves transactions between start and end dates
 * @param start start date
 * @param end end date
 * @returns list of transactions
 */
export const getTransactionsByDate = async (start: Date, end: Date) => {
  const { data, error } = await upGET('/accounts/{accountId}/transactions', {
    params: {
      path: { accountId: process.env.UP_TRANS_ACC || '' },
      query: {
        'filter[since]': start.toISOString(),
        'filter[until]': end.toISOString(),
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
  });

  if (error || !data) {
    throw new Error('unable to retrieve data');
  }

  const transactions = data.links.next
    ? data.data.concat(await getNextPage(data.links.next))
    : data.data;
  const insert = await insertTransactions(transactions);
  console.log(`Inserted: ${insert?.insertedCount} documents`);
  return filterTransactionFields(transactions);
};
