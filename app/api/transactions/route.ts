import { paths } from '@/types/up-api';
import { insertTransactions } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import createClient from 'openapi-fetch';

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
 * Returns all transactions between specified time range
 * * Time range is required
 * ! May run into rate-limit issues
 */
export async function GET(request: NextRequest) {
  const { data, error } = await upGET('/accounts/{accountId}/transactions', {
    params: {
      path: { accountId: process.env.UP_TRANS_ACC || '' },
      query: {
        'filter[since]': request.nextUrl.searchParams.get('start') || undefined,
        'filter[until]': request.nextUrl.searchParams.get('end') || undefined,
      },
    },
    headers: {
      Authorization: `Bearer ${process.env.UP_TOKEN}`,
    },
  });

  if (data && data?.links?.next) {
    const transactions = data.data.concat(await getNextPage(data.links.next));
    const insert = await insertTransactions(transactions);
    console.log(`Inserted: ${insert?.insertedCount} documents`);
    return NextResponse.json({
      data: transactions,
    });
  } else if (data) {
    const transactions = data.data;
    const insert = await insertTransactions(transactions);
    console.log(`Inserted: ${insert?.insertedCount} documents`);
    return NextResponse.json({
      data: data.data,
    });
  } else {
    return NextResponse.json(error);
  }
}
