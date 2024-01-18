import { replaceTransactions } from '@/db';
import { getCurrentUser } from '@/utils/auth';
import { addTags, deleteTags } from '@/utils/up';
import { NextRequest, NextResponse } from 'next/server';

const validateTags = (tags: any) =>
  Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');

/**
 * Returns specific transaction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string | undefined } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorised',
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { tags } = body;
  const { id } = params;
  if (id && validateTags(tags)) {
    // Add tag(s) to transaction
    const { error, response } = await addTags(id, tags);
    error && console.error(error);
    const res = await replaceTransactions([id]);
    console.log(res);
    return response.ok && res > 0
      ? NextResponse.json({}, { status: 200 })
      : NextResponse.json({}, { status: 500 });
  } else {
    return NextResponse.json(
      {
        error: 'Bad Request',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string | undefined } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorised',
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { tags } = body;
  const { id } = params;
  if (id && validateTags(tags)) {
    // Delete tag from transaction
    const { error, response } = await deleteTags(id, tags);
    error && console.error(error);
    const res = await replaceTransactions([id]);
    return response.ok && res > 0
      ? NextResponse.json({}, { status: 200 })
      : NextResponse.json({}, { status: 500 });
  } else {
    return NextResponse.json(
      {
        error: 'Bad Request',
      },
      { status: 400 }
    );
  }
}
