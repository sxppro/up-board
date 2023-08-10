import { categoryStats, monthlyStats } from '@/db';
import { endOfMonth } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (
    request.nextUrl.searchParams.has('type') &&
    request.nextUrl.searchParams.has('start') &&
    request.nextUrl.searchParams.has('end')
  ) {
    try {
      const type = request.nextUrl.searchParams.get('type') || '';
      const start = new Date(request.nextUrl.searchParams.get('start') || '');
      const end = new Date(request.nextUrl.searchParams.get('end') || '');
      console.log(endOfMonth(end));
      if (type === 'monthly') {
        const data = await monthlyStats(start, end);
        return NextResponse.json({ data });
      } else if (type === 'category') {
        const data = await categoryStats(start, end);
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
