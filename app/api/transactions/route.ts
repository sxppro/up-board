import { getTransactionsByDate } from '@/utils/data';
import { getCurrentUser } from '@/utils/session';
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

  return NextResponse.json({
    data: await getTransactionsByDate(
      new Date(request.nextUrl.searchParams.get('start') as string),
      new Date(request.nextUrl.searchParams.get('end') as string)
    ),
  });
}
