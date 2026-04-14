import { NextResponse, NextRequest } from 'next/server';
import { parseImages } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to secure admin routes
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where = search
    ? { name: { contains: search } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const mappedProducts = products.map(p => ({
    ...p,
    images: parseImages(p.images)
  }));

  return NextResponse.json({ products: mappedProducts, total, page, limit });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { name, description, price, stock, categoryId, newCategoryName, images } = body;

  if (!name || !description || price == null || stock == null || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ensure category exists, or create a custom one
  let catId = categoryId;
  if (categoryId === 'new' && newCategoryName) {
    let cat = await prisma.category.findFirst({ 
      where: { name: newCategoryName } 
    });
    if (!cat) {
      cat = await prisma.category.create({ 
        data: { name: newCategoryName, description: 'Custom category' } 
      });
    }
    catId = cat.id;
  }

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: catId,
      images: JSON.stringify(images || []),
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, product: newProduct });
}
