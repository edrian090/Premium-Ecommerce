import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/cart/sync
// Called on login. Merges the client's local cart items into the DB cart,
// then returns the full merged cart so the client can overwrite localStorage.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // localItems: the cart items that were in localStorage before login
  const { localItems } = (await req.json()) as {
    localItems: { id: string; quantity: number }[];
  };

  // Upsert the cart record
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  // Merge: for each local item, upsert into DB (add quantities)
  if (Array.isArray(localItems) && localItems.length > 0) {
    for (const localItem of localItems) {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: localItem.id } },
      });

      if (existing) {
        // Merge: take the greater quantity (or sum — currently using max to avoid inflation)
        await prisma.cartItem.update({
          where: { cartId_productId: { cartId: cart.id, productId: localItem.id } },
          data: { quantity: Math.max(existing.quantity, localItem.quantity) },
        });
      } else {
        // Verify product exists before inserting
        const product = await prisma.product.findUnique({ where: { id: localItem.id } });
        if (product) {
          await prisma.cartItem.create({
            data: { cartId: cart.id, productId: localItem.id, quantity: localItem.quantity },
          });
        }
      }
    }
  }

  // Return the full merged cart
  const updatedCart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, price: true, images: true } },
        },
      },
    },
  });

  const items = (updatedCart?.items ?? []).map((ci: { quantity: number; product: { id: string; name: string; price: number; images: string } }) => {
    const imgs = JSON.parse(ci.product.images || '[]');
    return {
      id: ci.product.id,
      name: ci.product.name,
      price: ci.product.price,
      image: imgs[0] ?? '',
      quantity: ci.quantity,
    };
  });

  return NextResponse.json({ items });
}
