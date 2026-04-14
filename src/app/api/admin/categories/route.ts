import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

export async function GET() {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const category = await prisma.category.create({ data: { name, description } });
  return NextResponse.json({ success: true, category });
}
