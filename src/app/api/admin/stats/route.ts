import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Last 30 days daily stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [summary, recentOrders, dailyOrders] = await Promise.all([
    // Summary stats
    Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'SHIPPED' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
    ]),
    // Recent orders (last 5)
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    // Daily aggregate for chart
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Build daily chart data (group by day)
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { revenue: 0, orders: 0 };
  }

  for (const order of dailyOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].orders += 1;
      if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        dailyMap[key].revenue += order.totalAmount;
      }
    }
  }

  const chartData = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    revenue: parseFloat(data.revenue.toFixed(2)),
    orders: data.orders,
  }));

  const [paid, shipped, delivered, totalOrders, totalUsers, totalProducts, pendingOrders, deliveredOrders] = summary;
  const totalRevenue = (paid._sum.totalAmount || 0) + (shipped._sum.totalAmount || 0) + (delivered._sum.totalAmount || 0);

  return NextResponse.json({
    stats: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
    },
    chartData,
    recentOrders,
  });
}
