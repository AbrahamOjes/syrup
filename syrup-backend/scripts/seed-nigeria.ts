import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nigerianMerchants = [
  {
    name: 'Jumia',
    domains: ['jumia.com.ng', 'ng.jumia.io'],
    logoUrl: 'https://www.jumia.com.ng/assets/images/logo.png',
    coupons: [
      {
        code: 'JUMIA20',
        title: '20% Off Everything',
        description: 'Get 20% discount on all items. Valid on orders above ₦5,000.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 5000,
        terms: 'Valid on all products. Cannot be combined with other offers.',
      },
      {
        code: 'FREESHIP',
        title: 'Free Shipping',
        description: 'Free delivery on orders above ₦10,000.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 10000,
        terms: 'Free shipping to all locations in Nigeria.',
      },
      {
        code: 'NEWUSER50',
        title: '₦500 Off First Order',
        description: 'New customers get ₦500 off their first purchase.',
        discountType: 'FIXED' as const,
        discountValue: 500,
        minOrderValue: 2000,
        terms: 'Valid for new users only. Minimum order ₦2,000.',
      },
    ],
  },
  {
    name: 'Konga',
    domains: ['konga.com'],
    logoUrl: 'https://www.konga.com/assets/images/logo.png',
    coupons: [
      {
        code: 'KONGA15',
        title: '15% Off Electronics',
        description: 'Save 15% on all electronics and gadgets.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 10000,
        terms: 'Valid on electronics category only.',
      },
      {
        code: 'FASHION25',
        title: '25% Off Fashion',
        description: 'Get 25% discount on fashion items.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 25,
        minOrderValue: 5000,
        terms: 'Valid on fashion and accessories.',
      },
      {
        code: 'SAVE1000',
        title: '₦1,000 Off Orders Above ₦20,000',
        description: 'Save ₦1,000 on orders over ₦20,000.',
        discountType: 'FIXED' as const,
        discountValue: 1000,
        minOrderValue: 20000,
        terms: 'All products eligible. Limited time offer.',
      },
    ],
  },
  {
    name: 'PayPorte',
    domains: ['payporte.com'],
    logoUrl: 'https://www.payporte.com/assets/images/logo.png',
    coupons: [
      {
        code: 'PP30',
        title: '30% Off Fashion Week',
        description: 'Exclusive 30% discount during fashion week.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 30,
        minOrderValue: 8000,
        terms: 'Valid on selected fashion items.',
      },
      {
        code: 'WELCOME500',
        title: '₦500 Welcome Bonus',
        description: 'New customers get ₦500 off.',
        discountType: 'FIXED' as const,
        discountValue: 500,
        minOrderValue: 3000,
        terms: 'First-time shoppers only.',
      },
    ],
  },
  {
    name: 'Slot',
    domains: ['slot.ng'],
    logoUrl: 'https://www.slot.ng/assets/images/logo.png',
    coupons: [
      {
        code: 'SLOT10',
        title: '10% Off Phones & Tablets',
        description: 'Get 10% discount on phones and tablets.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 50000,
        terms: 'Valid on phones and tablets only.',
      },
      {
        code: 'ACCESSORIES20',
        title: '20% Off Accessories',
        description: 'Save 20% on phone accessories.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 5000,
        terms: 'Accessories only.',
      },
    ],
  },
  {
    name: 'Jiji',
    domains: ['jiji.ng'],
    logoUrl: 'https://www.jiji.ng/assets/images/logo.png',
    coupons: [
      {
        code: 'JIJI15',
        title: '15% Off Featured Listings',
        description: 'Save 15% on all featured products.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 10000,
        terms: 'Featured products only.',
      },
    ],
  },
  {
    name: 'Dealdey',
    domains: ['dealdey.com'],
    logoUrl: 'https://www.dealdey.com/assets/images/logo.png',
    coupons: [
      {
        code: 'DEAL50',
        title: '₦500 Off Daily Deals',
        description: 'Extra ₦500 off on daily deals.',
        discountType: 'FIXED' as const,
        discountValue: 500,
        minOrderValue: 5000,
        terms: 'Valid on deal of the day products.',
      },
      {
        code: 'WEEKEND20',
        title: '20% Weekend Discount',
        description: 'Get 20% off on weekends.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 3000,
        terms: 'Valid Saturday and Sunday only.',
      },
    ],
  },
  {
    name: 'Supermart.ng',
    domains: ['supermart.ng'],
    logoUrl: 'https://www.supermart.ng/assets/images/logo.png',
    coupons: [
      {
        code: 'GROCERY10',
        title: '10% Off Groceries',
        description: 'Save 10% on grocery shopping.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 15000,
        terms: 'Groceries and household items.',
      },
      {
        code: 'FRESHFREE',
        title: 'Free Delivery on Fresh Foods',
        description: 'Free delivery for fresh food orders.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 10000,
        terms: 'Fresh foods only.',
      },
    ],
  },
  {
    name: 'Mall for Africa',
    domains: ['mallforafrica.com'],
    logoUrl: 'https://www.mallforafrica.com/assets/images/logo.png',
    coupons: [
      {
        code: 'MFA15',
        title: '15% Off International Brands',
        description: 'Save 15% on international products.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 20000,
        terms: 'International shipping items only.',
      },
      {
        code: 'FIRSTBUY20',
        title: '20% Off First International Order',
        description: 'New customers get 20% off their first order.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 30000,
        terms: 'New users only. International products.',
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding Nigerian merchants and coupons...\n');

  for (const merchantData of nigerianMerchants) {
    console.log(`📦 Creating merchant: ${merchantData.name}`);

    // Create or update merchant
    const merchant = await prisma.merchant.upsert({
      where: { name: merchantData.name },
      update: {
        domains: merchantData.domains,
        logoUrl: merchantData.logoUrl,
      },
      create: {
        name: merchantData.name,
        domains: merchantData.domains,
        logoUrl: merchantData.logoUrl,
      },
    });

    console.log(`✅ Merchant created: ${merchant.name} (ID: ${merchant.id})`);

    // Create coupons
    for (const couponData of merchantData.coupons) {
      const coupon = await prisma.coupon.upsert({
        where: {
          id: 0, // Dummy ID for upsert
        },
        update: {},
        create: {
          ...couponData,
          merchantId: merchant.id,
          score: 75, // Give Nigerian merchants a good starting score
        },
      });

      console.log(`  💳 Coupon added: ${coupon.code} - ${coupon.title}`);
    }

    console.log('');
  }

  // Print summary
  const totalMerchants = await prisma.merchant.count();
  const totalCoupons = await prisma.coupon.count();

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║         🎉 Seeding Complete!              ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  Total Merchants: ${totalMerchants.toString().padEnd(23)} ║`);
  console.log(`║  Total Coupons: ${totalCoupons.toString().padEnd(25)} ║`);
  console.log('╚═══════════════════════════════════════════╝');
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
