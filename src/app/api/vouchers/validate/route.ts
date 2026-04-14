import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({ error: 'This voucher is no longer active' }, { status: 400 });
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This voucher has expired' }, { status: 400 });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ error: 'This voucher has reached its usage limit' }, { status: 400 });
    }

    if (subtotal < voucher.minSpend) {
      return NextResponse.json({ 
        error: `Minimum spend of $${voucher.minSpend.toFixed(2)} required for this voucher` 
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discount = subtotal * (voucher.discountValue / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
