import { getAccountBalance, getCategoryInfo, getMonthlyInfo } from '@/db';
import { TransactionAccountType } from '@/types/custom';
import { getCurrentUser } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

const validateSearchParams = (params: URLSearchParams) => {
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

  if (validateSearchParams(request.nextUrl.searchParams)) {
    try {
      const type = request.nextUrl.searchParams.get('type') || '';
      const from = new Date(request.nextUrl.searchParams.get('start') || '');
      const to = new Date(request.nextUrl.searchParams.get('end') || '');
      if (type === 'monthly') {
        const data = await getMonthlyInfo({ from, to });
        return NextResponse.json({ data });
      } else if (type === 'category') {
        const data = await getCategoryInfo({ from, to }, 'child');
        return NextResponse.json({ data });
      } else if (type === 'parentCategory') {
        const data = await getCategoryInfo({ from, to }, 'parent');
        return NextResponse.json({ data });
      } else if (type === 'accountBalance') {
        const data = await getAccountBalance(
          from,
          to,
          (request.nextUrl.searchParams.get(
            'account'
          ) as TransactionAccountType) || 'transactional'
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
