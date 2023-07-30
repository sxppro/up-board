import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const res = await fetch(
    `https://api.up.com.au/api/v1/accounts/${process.env.UP_TRANS_ACC}/transactions`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UP_TOKEN}`,
      },
    }
  );
  console.log(request.nextUrl.searchParams);
  const data = await res.json();

  return NextResponse.json(data);
}
