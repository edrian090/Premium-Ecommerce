import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/cart — fetch the current user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ items: [] });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ items: [] });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, price: true, images: true } },
        },
      },
    },
  });

  if (!cart) return NextResponse.json({ items: [] });

  const items = cart.items.map((ci: { quantity: number; product: { id: string; name: string; price: number; images: string } }) => {
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

// POST /api/cart — add or update an item
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Upsert cart
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  // Upsert cart item
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: quantity !== undefined ? quantity : existingItem.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: quantity ?? 1 },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/cart — remove a specific item { productId }
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return NextResponse.json({ success: true });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  return NextResponse.json({ success: true });
}

// PUT /api/cart — clear all items
export async function PUT() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json({ success: true });
}
