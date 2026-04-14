import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-10-28.acacia' as any,
});

async function dispatchSimulatedEmail(email: string, amount: number) {
  console.log('\n====================================');
  console.log('📧 [SIMULATED EMAIL DISPATCHER]');
  console.log(`To: ${email}`);
  console.log(`Subject: Your Storefront Receipt`);
  console.log(`Body: Thank you for your purchase of $${amount.toFixed(2)}! Your order is being processed.`);
  console.log('====================================\n');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { items, shippingDetails, paymentMethod, voucherCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Combine shipping details into a formatted single string
    const fullShippingAddress = `${shippingDetails.firstName} ${shippingDetails.lastName}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zip}`;

    let totalAmount = 0;
    const lineItems = items.map((item: any) => {
      totalAmount += item.price * item.quantity;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Subtotal variables
    const subtotal = totalAmount;
    const shippingCost = 10;
    const taxes = totalAmount * 0.08;
    
    // Voucher discount calculation
    let discountAmount = 0;
    let appliedVoucherCode: string | null = null;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode.toUpperCase() },
      });

      if (voucher && voucher.isActive && voucher.usedCount < voucher.usageLimit) {
        const notExpired = !voucher.expiresAt || new Date(voucher.expiresAt) >= new Date();
        const meetsMinSpend = subtotal >= voucher.minSpend;

        if (notExpired && meetsMinSpend) {
          if (voucher.discountType === 'PERCENTAGE') {
            discountAmount = subtotal * (voucher.discountValue / 100);
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
              discountAmount = voucher.maxDiscount;
            }
          } else {
            discountAmount = voucher.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          discountAmount = Math.round(discountAmount * 100) / 100;
          appliedVoucherCode = voucher.code;

          // Increment usage count
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    totalAmount = subtotal + shippingCost + taxes - discountAmount;

    // Add Shipping
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });

    // Add Taxes
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Taxes (8%)' },
        unit_amount: Math.round(taxes * 100),
      },
      quantity: 1,
    });

    // Determine initial order status based on payment method
    const selectedPaymentMethod = paymentMethod || 'COD';
    const initialStatus = selectedPaymentMethod === 'CARD' ? 'TO_PAY' : 'TO_PAY';

    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: totalAmount,
        shippingAddress: fullShippingAddress,
        status: initialStatus,
        paymentMethod: selectedPaymentMethod,
        voucherCode: appliedVoucherCode,
        discountAmount: discountAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      }
    });

    // For COD or GCash: simulate payment, mark as TO_SHIP directly
    if (selectedPaymentMethod === 'COD' || selectedPaymentMethod === 'GCASH') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'TO_SHIP' }
      });
      await dispatchSimulatedEmail(shippingDetails.email || session.user.email, totalAmount);
      return NextResponse.json({ url: `/checkout/success?session_id=simulated` });
    }

    // For CARD payment: try Stripe
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder' || !process.env.STRIPE_SECRET_KEY) {
      // Simulated card payment
      await prisma.order.update({
         where: { id: order.id },
         data: { status: 'TO_SHIP' }
      });
      await dispatchSimulatedEmail(shippingDetails.email || session.user.email, totalAmount);
      return NextResponse.json({ url: `/checkout/success?session_id=simulated` });
    }

    // Create a real Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
