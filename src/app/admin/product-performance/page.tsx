import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Search, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductPerformanceClient from './ProductPerformanceClient';

export default async function ProductPerformancePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  const search = searchParams.search || '';

  // Get all products passing optional search filter
  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search } } : {},
    include: {
      category: true,
      orderItems: {
        include: {
          order: {
            select: { status: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate metrics
  const analyzedProducts = products.map((product) => {
    // Only count order items if they are not cancelled. Let's assume all orders are active except possibly "CANCELLED" if that exists. Right now order statuses are TO_PAY, TO_SHIP, etc.
    let unitsSold = 0;
    let grossRevenue = 0;

    product.orderItems.forEach(item => {
      // Just summing all purchases up
      unitsSold += item.quantity;
      grossRevenue += (item.quantity * item.price);
    });

    return {
      ...product,
      unitsSold,
      grossRevenue,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Product Tracking</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Monitor sales velocity and apply percentage discounts directly.
          </p>
        </div>
      </div>

      {/* Content */}
      <ProductPerformanceClient analyzedProducts={analyzedProducts} />
    </div>
  );
}
