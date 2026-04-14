import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Voucher ID is required' }, { status: 400 });
    }

    const voucher = await prisma.voucher.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Voucher deleted successfully', voucher });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
