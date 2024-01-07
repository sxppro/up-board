import { categoryStats, getAccountBalance, monthlyStats } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

const checkSearchParams = (params: URLSearchParams) => {
  const mainParams =
    params.has('type') && params.has('start') && params.has('end');

  if (params.get('type') === 'accountBalance') {
    return (
      mainParams &&
      (params.get('account') === 'transactional' ||
        params.get('account') === 'savings')
    );
  }
  return mainParams;
};

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

  if (checkSearchParams(request.nextUrl.searchParams)) {
    try {
      const type = request.nextUrl.searchParams.get('type') || '';
      const start = new Date(request.nextUrl.searchParams.get('start') || '');
      const end = new Date(request.nextUrl.searchParams.get('end') || '');
      if (type === 'monthly') {
        const data = await monthlyStats(start, end);
        return NextResponse.json({ data });
      } else if (type === 'category') {
        const data = await categoryStats(start, end, 'child');
        return NextResponse.json({ data });
      } else if (type === 'parentCategory') {
        const data = await categoryStats(start, end, 'parent');
        return NextResponse.json({ data });
      } else if (type === 'accountBalance') {
        const data = await getAccountBalance(
          start,
          end,
          (request.nextUrl.searchParams.get('account') as
            | 'transactional'
            | 'savings') || 'transactional'
        );
        return NextResponse.json({ data });
      } else {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
