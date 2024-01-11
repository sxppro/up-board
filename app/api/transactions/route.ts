import { getTransactionsByDate, getTransfers } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { filterTransactionFields } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

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
  } else {
    const transactions = await getTransactionsByDate(
      {
        from: new Date(request.nextUrl.searchParams.get('start') as string),
        to: new Date(request.nextUrl.searchParams.get('end') as string),
      },
      {
        sort: request.nextUrl.searchParams.get('sort') as 'time' | 'amount',
        sortDir: request.nextUrl.searchParams.get('sortDir') as 'asc' | 'desc',
      }
    );
    return NextResponse.json({
      data: filterTransactionFields(transactions),
    });
  }
}
