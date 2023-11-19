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

  return NextResponse.json({
    data: await getTransactionsByDate(
      new Date(request.nextUrl.searchParams.get('start') || ''),
      new Date(request.nextUrl.searchParams.get('end') || '')
    ),
  });
}
