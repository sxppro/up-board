/**
 * Data retrieval from Up endpoints
 */

import { insertTransactions } from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { paths } from '@/types/up-api';
import createClient from 'openapi-fetch';

const {
  GET: upGET,
  POST: upPOST,
  DELETE: upDELETE,
} = createClient<paths>({
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
 * Retrieves attachment by id
 * @param id attachment id
 * @returns attachment details, including file link
 */
export const getAttachment = async (id: string) => {
  return await upGET('/attachments/{id}', {
    params: {
      path: {
        id,
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
  });
};

/**
 * Retrieves all tags
 * @returns array of tags
 */
export const getTags = async () => {
  const { data, error } = await upGET('/tags', {
    params: {},
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
  });

  if (error || !data) {
    throw new Error('unable to retrieve tags information from Up');
  }

  const tags = data.links.next
    ? data.data.concat(await getNextPage(data.links.next))
    : data.data;
  return tags;
};

/**
 * Modifies tags for a transaction
 * @param id
 * @param tags array of tag ids (maximum of 6)
 * @see https://developer.up.com.au/#post_transactions_transactionId_relationships_tags
 */
export const addTags = async (id: string, tags: string[]) => {
  const body = { data: tags.map((tag) => ({ type: 'tags', id: tag })) };
  return await upPOST('/transactions/{transactionId}/relationships/tags', {
    params: {
      path: {
        transactionId: id,
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
    body,
  });
};

/**
 * Deletes tags from a transaction
 * @param id
 * @param tags
 * @see https://developer.up.com.au/#delete_transactions_transactionId_relationships_tags
 */
export const deleteTags = async (id: string, tags: string[]) => {
  const body = { data: tags.map((tag) => ({ type: 'tags', id: tag })) };
  return await upDELETE('/transactions/{transactionId}/relationships/tags', {
    params: {
      path: {
        transactionId: id,
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
    body,
  });
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

/**
 * Retrieves all transactions for an account
 * Useful for syncing data to db
 * @param accountId account ID
 * @returns list of transactions
 */
export const getTransactionByAccount = async (
  accountId: string,
  insert: boolean = false
) => {
  const { data, error } = await upGET('/accounts/{accountId}/transactions', {
    params: {
      path: { accountId },
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
  if (insert) {
    const insertResult = await insertTransactions(transactions);
    console.log(`Inserted: ${insertResult?.insertedCount} documents`);
  }
  return transactions;
};

/**
 * Retrieves transaction by id
 * @param transactionId
 * @returns
 */
export const getTransactionById = async (transactionId: string) => {
  const { data, error } = await upGET('/transactions/{id}', {
    params: {
      path: {
        id: transactionId,
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
  });

  if (error || !data) {
    throw new Error('unable to retrieve transaction details from Up');
  }

  return data;
};
