import { getTransactionById } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { filterTransactionFields } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns specific transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string | undefined } }
) {
  const { id } = params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorised',
      },
      { status: 403 }
    );
  }

  if (id) {
    const transaction = await getTransactionById(id);
    return transaction
      ? NextResponse.json({
          data: filterTransactionFields([transaction])[0],
        })
      : NextResponse.json(
          {
            data: [],
          },
          { status: 404 }
        );
  } else {
    return NextResponse.json(
      {
        error: 'Bad Request',
      },
      { status: 400 }
    );
  }
}
