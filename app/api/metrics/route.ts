import { monthlyStats } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (
    request.nextUrl.searchParams.has('start') &&
    request.nextUrl.searchParams.has('end')
  ) {
    try {
      const start = new Date(request.nextUrl.searchParams.get('start') || '');
      const end = new Date(request.nextUrl.searchParams.get('end') || '');
      const data = await monthlyStats(start, end);
      return NextResponse.json({ data });
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
