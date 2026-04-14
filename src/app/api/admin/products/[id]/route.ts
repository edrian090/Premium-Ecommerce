import { NextResponse, NextRequest } from 'next/server';
import { parseImages } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ 
    product: {
      ...product,
      images: parseImages(product.images)
    } 
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { name, description, price, stock, categoryId, newCategoryName, images } = body;

  if (!name || !description || price == null || stock == null || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

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

  const updated = await prisma.product.update({
    where: { id: params.id },
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

  return NextResponse.json({ 
    success: true, 
    product: {
      ...updated,
      images: parseImages(updated.images)
    } 
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  // Remove from wishlists and order items first to avoid FK violations
  await prisma.wishlistProduct.deleteMany({ where: { productId: params.id } });
  await prisma.review.deleteMany({ where: { productId: params.id } });
  await prisma.product.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
