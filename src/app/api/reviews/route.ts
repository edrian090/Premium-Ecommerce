import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    const userId = session.user.id as string;

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review Error:", error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
