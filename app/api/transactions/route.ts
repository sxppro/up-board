import { getTransactionsByDate, getTransfers } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { filterTransactionFields } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

const validateSearchParams = (params: URLSearchParams) => {
  let valid = true;
  if (params.has('account')) {
    valid =
      valid &&
      (params.get('account') === 'transactional' ||
        params.get('account') === 'savings');
  }
  if (params.has('sort')) {
    valid =
      valid &&
      (params.get('sort') === 'amount' || params.get('sort') === 'time');
  }
  if (params.has('sortDir')) {
    valid =
      valid &&
      (params.get('sortDir') === 'asc' || params.get('sortDir') === 'desc');
  }
  if (params.has('limit')) {
    valid = valid && !isNaN(parseInt(params.get('limit') || ''));
  }
  return valid;
};

/**
 * Returns all transactions between specified time range
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorised',
      },
      { status: 403 }
    );
  }

  /**
   * Check date validity
   */
  if (
    isNaN(
      new Date(request.nextUrl.searchParams.get('start') || '').getTime()
    ) ||
    isNaN(new Date(request.nextUrl.searchParams.get('end') || '').getTime())
  ) {
    return NextResponse.json(
      {
        error: 'Bad Request',
      },
      { status: 400 }
    );
  }

  if (request.nextUrl.searchParams.get('type') === 'transfers') {
    const transactions = await getTransfers({
      from: new Date(request.nextUrl.searchParams.get('start') as string),
      to: new Date(request.nextUrl.searchParams.get('end') as string),
    });
    return NextResponse.json({
      data: filterTransactionFields(transactions),
    });
  } else if (validateSearchParams(request.nextUrl.searchParams)) {
    const account = request.nextUrl.searchParams.get('account');
    const transactions = await getTransactionsByDate(
      account === 'transactional'
        ? process.env.UP_TRANS_ACC || ''
        : account === 'savings'
        ? process.env.UP_SAVINGS_ACC || ''
        : '',
      {
        from: new Date(request.nextUrl.searchParams.get('start') as string),
        to: new Date(request.nextUrl.searchParams.get('end') as string),
      },
      {
        sort:
          (request.nextUrl.searchParams.get('sort') as 'time' | 'amount') ||
          'time',
        sortDir:
          (request.nextUrl.searchParams.get('sortDir') as 'asc' | 'desc') ||
          'desc',
        // @ts-expect-error
        limit: request.nextUrl.searchParams.get('limit'),
      }
    );
    return NextResponse.json({
      data: filterTransactionFields(transactions),
    });
  } else {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
