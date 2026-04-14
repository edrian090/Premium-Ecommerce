import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Valid status transitions
const userTransitions: Record<string, string[]> = {
  'DELIVERED': ['TO_RATE', 'COMPLETED'],
  'TO_RATE': ['COMPLETED'],
};

const adminTransitions: Record<string, string[]> = {
  'TO_PAY': ['TO_SHIP'],
  'TO_SHIP': ['TO_RECEIVE'],
  'TO_RECEIVE': ['DELIVERED'],
};

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status: newStatus } = await req.json();
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN';
    const isOwner = order.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate transition
    const validTransitions = isAdmin 
      ? { ...adminTransitions, ...userTransitions }
      : userTransitions;

    const expectedNext = validTransitions[order.status];

    if (!expectedNext || !expectedNext.includes(newStatus)) {
      return NextResponse.json({ 
        error: `Cannot transition from ${order.status} to ${newStatus}` 
      }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
