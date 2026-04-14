import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS = {
  storeName: 'My Store',
  contactEmail: 'admin@mystore.com',
  currency: 'USD',
  currencySymbol: '$',
  maintenanceMode: false,
  allowRegistrations: true,
  ordersPerPage: 20,
  featuredProductIds: [] as string[],
  // Extended settings
  storeDescription: '',
  storeUrl: '',
  taxRate: 0,
  freeShippingThreshold: 0,
  enableEmailNotifications: true,
  newOrderNotification: true,
  lowStockNotification: true,
  lowStockThreshold: 5,
  enableReviews: true,
  requireApproval: false,
  maxOrderItems: 50,
  sessionTimeout: 30,
  timezone: 'UTC',
};

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(data: typeof DEFAULT_SETTINGS) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

export async function GET() {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });
  return NextResponse.json({ settings: readSettings() });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const current = readSettings();
  const merged = { ...current, ...body };
  writeSettings(merged);

  return NextResponse.json({ success: true, settings: merged });
}
