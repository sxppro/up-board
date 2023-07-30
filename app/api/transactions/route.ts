import { NextRequest, NextResponse } from 'next/server';

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
  console.log(link);
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
  const res = await fetch(
    `https://api.up.com.au/api/v1/accounts/${
      process.env.UP_TRANS_ACC
    }/transactions?${new URLSearchParams({
      'filter[since]': request.nextUrl.searchParams.get('start') || '',
      'filter[until]': request.nextUrl.searchParams.get('end') || '',
    })}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UP_TOKEN}`,
      },
    }
  );

  const data = await res.json();

  return res.ok && data?.links?.next
    ? NextResponse.json({
        data: data.data.concat(await getNextPage(data.links.next)),
      })
    : NextResponse.json(data);
}
