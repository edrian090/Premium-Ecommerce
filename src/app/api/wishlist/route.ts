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

    const { productId } = await req.json();
    if (!productId) {
      return new NextResponse('Missing product ID', { status: 400 });
    }

    const userId = session.user.id as string;

    // Grab or create user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId }
      });
    }

    // Check if item is already in wishlist
    const existingEntry = await prisma.wishlistProduct.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    // Toggle: if exists, remove it. If not, add it.
    if (existingEntry) {
      await prisma.wishlistProduct.delete({
        where: {
          wishlistId_productId: { wishlistId: wishlist.id, productId }
        }
      });
      return NextResponse.json({ success: true, status: 'removed' });
    } else {
      await prisma.wishlistProduct.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
      return NextResponse.json({ success: true, status: 'added' });
    }
  } catch (error: any) {
    console.error("Wishlist Error:", error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
