import { getCurrentUser } from '@/utils/auth';
import { getTags } from '@/utils/up';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns specific transaction
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

  const tags = await getTags();

  return NextResponse.json({
    data: tags.map(({ id }) => ({ name: id, value: id })),
  });
}
