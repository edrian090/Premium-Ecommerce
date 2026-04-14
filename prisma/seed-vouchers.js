const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedVouchers() {
  const vouchers = [
    {
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpend: 20,
      maxDiscount: 50,
      usageLimit: 500,
      expiresAt: new Date('2027-12-31'),
    },
    {
      code: 'SAVE5',
      description: '$5 off your order',
      discountType: 'FIXED',
      discountValue: 5,
      minSpend: 30,
      maxDiscount: null,
      usageLimit: 200,
      expiresAt: new Date('2027-06-30'),
    },
    {
      code: 'FREESHIP',
      description: '$10 off (free shipping)',
      discountType: 'FIXED',
      discountValue: 10,
      minSpend: 50,
      maxDiscount: null,
      usageLimit: 300,
      expiresAt: new Date('2027-12-31'),
    },
    {
      code: 'MEGA20',
      description: '20% off — Mega Sale',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minSpend: 100,
      maxDiscount: 100,
      usageLimit: 100,
      expiresAt: new Date('2027-03-31'),
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
    console.log(`✅ Voucher ${v.code} seeded`);
  }

  console.log('\nAll vouchers seeded successfully!');
}

seedVouchers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
