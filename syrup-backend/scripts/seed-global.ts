import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Global Merchant Seed Data
 * Top international e-commerce sites that Nigerians shop from
 * Source: SimilarWeb, Semrush, eCommerceDB rankings (2024-2025)
 */

const globalMerchants = [
  // === FASHION & APPAREL ===
  {
    name: 'SHEIN',
    domains: ['shein.com', 'us.shein.com', 'm.shein.com'],
    logoUrl: 'https://img.shein.com/images/shein-logo.svg',
    coupons: [
      {
        code: 'SAVE20',
        title: '20% Off Your Order',
        description: 'Get 20% off on orders over $50. New and existing customers.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 50,
        terms: 'Valid on regular-priced items. Excludes sale items.',
      },
      {
        code: 'FREESHIP',
        title: 'Free Shipping on Orders Over $49',
        description: 'Free standard shipping on all orders over $49.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 49,
        terms: 'Standard shipping only. Expedited shipping excluded.',
      },
      {
        code: 'FIRST15',
        title: '15% Off First Order',
        description: 'New customers get 15% off their first purchase.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 30,
        terms: 'First-time shoppers only. Minimum $30 purchase.',
      },
    ],
  },
  {
    name: 'Zara',
    domains: ['zara.com', 'www.zara.com'],
    logoUrl: 'https://static.zara.net/static/images/logo.svg',
    coupons: [
      {
        code: 'ZARA10',
        title: '10% Off Newsletter Signup',
        description: 'Subscribe to newsletter and get 10% off your next order.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 50,
        terms: 'New subscribers only.',
      },
    ],
  },
  {
    name: 'ASOS',
    domains: ['asos.com', 'www.asos.com'],
    logoUrl: 'https://www.asos.com/images/logo.svg',
    coupons: [
      {
        code: 'ASOS20',
        title: '20% Off Student Discount',
        description: 'Students get 20% off all year round.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 0,
        terms: 'Valid student ID required via UNiDAYS.',
      },
      {
        code: 'NEWUSER',
        title: '15% Off First Order',
        description: 'New customers save 15% on their first purchase.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 40,
        terms: 'First-time buyers only.',
      },
    ],
  },
  {
    name: 'H&M',
    domains: ['hm.com', 'www2.hm.com'],
    logoUrl: 'https://www.hm.com/entrance/assets/bundle/img/HM-Share-Image.jpg',
    coupons: [
      {
        code: 'HMVIP',
        title: '10% Off for Members',
        description: 'H&M members get 10% off their purchase.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 0,
        terms: 'H&M membership required (free to join).',
      },
    ],
  },
  {
    name: 'Nike',
    domains: ['nike.com', 'www.nike.com'],
    logoUrl: 'https://www.nike.com/assets/experience/retail-membership/swoosh.svg',
    coupons: [
      {
        code: 'NIKE15',
        title: '15% Off Nike App Orders',
        description: 'Download the Nike app and get 15% off your first order.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 0,
        terms: 'Nike app users only.',
      },
    ],
  },
  {
    name: 'Adidas',
    domains: ['adidas.com', 'www.adidas.com'],
    logoUrl: 'https://www.adidas.com/glass/react/e963fd6/assets/img/adidas-logo.svg',
    coupons: [
      {
        code: 'ADICLUB',
        title: '15% Off for Adiclub Members',
        description: 'Join Adiclub and save 15% on your next purchase.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 0,
        terms: 'Adiclub membership required (free to join).',
      },
    ],
  },

  // === MARKETPLACE & GENERAL RETAIL ===
  {
    name: 'Amazon',
    domains: ['amazon.com', 'www.amazon.com', 'amazon.co.uk', 'amazon.de'],
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    coupons: [
      {
        code: 'PRIME20',
        title: '20% Off Subscribe & Save',
        description: 'Save 20% on subscriptions with 5 or more items.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 0,
        terms: 'Prime membership required. Subscribe & Save items only.',
      },
      {
        code: 'PRIMEFREE',
        title: 'Free Shipping for Prime Members',
        description: 'Prime members get free 2-day shipping on eligible items.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 0,
        terms: 'Amazon Prime membership required.',
      },
    ],
  },
  {
    name: 'eBay',
    domains: ['ebay.com', 'www.ebay.com'],
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    coupons: [
      {
        code: 'EBAY15',
        title: '15% Off Electronics',
        description: 'Save 15% on electronics with code.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 25,
        maxDiscountAmount: 100,
        terms: 'Electronics category only. Max discount $100.',
      },
    ],
  },
  {
    name: 'AliExpress',
    domains: ['aliexpress.com', 'www.aliexpress.com'],
    logoUrl: 'https://ae01.alicdn.com/kf/HTB1S.wKKf1TBuNjy0Fjq6xjyXXao.png',
    coupons: [
      {
        code: 'WELCOME8',
        title: '$8 Off Orders Over $60',
        description: 'New users get $8 off their first order.',
        discountType: 'FIXED' as const,
        discountValue: 8,
        minOrderValue: 60,
        terms: 'New users only. One-time use.',
      },
      {
        code: 'SHIP99',
        title: 'Free Shipping on Orders $99+',
        description: 'Free standard shipping on orders over $99.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 99,
        terms: 'Standard shipping only.',
      },
    ],
  },
  {
    name: 'Walmart',
    domains: ['walmart.com', 'www.walmart.com'],
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
    coupons: [
      {
        code: 'WALMARTPLUS',
        title: 'Free Shipping with Walmart+',
        description: 'Walmart+ members get free unlimited shipping.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 0,
        terms: 'Walmart+ membership required ($98/year).',
      },
    ],
  },

  // === BEAUTY & COSMETICS ===
  {
    name: 'Sephora',
    domains: ['sephora.com', 'www.sephora.com'],
    logoUrl: 'https://www.sephora.com/contentimages/meganav/sephora_logo.svg',
    coupons: [
      {
        code: 'BEAUTY15',
        title: '15% Off Beauty Insider Sale',
        description: 'Beauty Insiders save 15% during sale events.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minOrderValue: 0,
        terms: 'Beauty Insider membership required (free).',
      },
      {
        code: 'FREESHIP50',
        title: 'Free Shipping on Orders $50+',
        description: 'Get free standard shipping on orders over $50.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 50,
        terms: 'Standard shipping only.',
      },
    ],
  },
  {
    name: 'Ulta Beauty',
    domains: ['ulta.com', 'www.ulta.com'],
    logoUrl: 'https://www.ulta.com/images/ulta-logo.svg',
    coupons: [
      {
        code: 'ULTA20',
        title: '20% Off Entire Purchase',
        description: 'Save 20% on your entire purchase including prestige.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderValue: 0,
        terms: 'Excludes certain brands. Check email for availability.',
      },
    ],
  },

  // === ELECTRONICS & TECH ===
  {
    name: 'Apple',
    domains: ['apple.com', 'www.apple.com'],
    logoUrl: 'https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg',
    coupons: [
      {
        code: 'STUDENT',
        title: 'Student Discount - Up to $200 Off',
        description: 'Students and educators save on Mac and iPad.',
        discountType: 'FIXED' as const,
        discountValue: 200,
        minOrderValue: 0,
        terms: 'Valid student/educator ID required via UNiDAYS.',
      },
    ],
  },
  {
    name: 'Best Buy',
    domains: ['bestbuy.com', 'www.bestbuy.com'],
    logoUrl: 'https://www.bestbuy.com/~assets/bby/_com/header/svg/logo.svg',
    coupons: [
      {
        code: 'STUDENT10',
        title: '10% Off for Students',
        description: 'Students save 10% on select tech.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 0,
        terms: 'Student verification required.',
      },
    ],
  },
  {
    name: 'Newegg',
    domains: ['newegg.com', 'www.newegg.com'],
    logoUrl: 'https://c1.neweggimages.com/WebResource/Themes/Nest/logos/logo_424x210.png',
    coupons: [
      {
        code: 'SAVE15',
        title: '$15 Off Orders Over $100',
        description: 'Save $15 on tech purchases over $100.',
        discountType: 'FIXED' as const,
        discountValue: 15,
        minOrderValue: 100,
        terms: 'Electronics and computer parts.',
      },
    ],
  },

  // === SPECIALTY & SPORTS ===
  {
    name: 'IKEA',
    domains: ['ikea.com', 'www.ikea.com'],
    logoUrl: 'https://www.ikea.com/global/assets/logos/brand/ikea-logo.svg',
    coupons: [
      {
        code: 'IKEAFAMILY',
        title: '10% Off Select Items for Members',
        description: 'IKEA Family members get exclusive discounts.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderValue: 0,
        terms: 'IKEA Family membership required (free).',
      },
    ],
  },
  {
    name: 'Target',
    domains: ['target.com', 'www.target.com'],
    logoUrl: 'https://corporate.target.com/press/images/Target-Logo.png',
    coupons: [
      {
        code: 'CIRCLE5',
        title: '5% Off with RedCard',
        description: 'Target RedCard holders save 5% every day.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 5,
        minOrderValue: 0,
        terms: 'Target RedCard required.',
      },
    ],
  },
  {
    name: 'Macy\'s',
    domains: ['macys.com', 'www.macys.com'],
    logoUrl: 'https://www.macys.com/assets/images/logo.svg',
    coupons: [
      {
        code: 'SAVE25',
        title: '25% Off Select Departments',
        description: 'Save 25% on clothing, shoes, and accessories.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 25,
        minOrderValue: 50,
        terms: 'Excludes certain brands and departments.',
      },
    ],
  },
  {
    name: 'Coach',
    domains: ['coach.com', 'www.coach.com'],
    logoUrl: 'https://www.coach.com/assets/images/coach-logo.svg',
    coupons: [
      {
        code: 'COACH30',
        title: '30% Off Select Styles',
        description: 'Save 30% on select handbags and accessories.',
        discountType: 'PERCENTAGE' as const,
        discountValue: 30,
        minOrderValue: 0,
        terms: 'Select styles only. Exclusions apply.',
      },
    ],
  },

  // === ASIAN MARKETPLACES ===
  {
    name: 'Taobao',
    domains: ['taobao.com', 'world.taobao.com'],
    logoUrl: 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbZLFXa-143-59.png',
    coupons: [
      {
        code: 'TB50',
        title: '¥50 Off Orders Over ¥300',
        description: 'New users save ¥50 on first orders.',
        discountType: 'FIXED' as const,
        discountValue: 50,
        minOrderValue: 300,
        terms: 'New users only. CNY currency.',
      },
    ],
  },
  {
    name: 'JD.com',
    domains: ['jd.com', 'www.jd.com', 'en.jd.com'],
    logoUrl: 'https://www.jd.com/favicon.ico',
    coupons: [
      {
        code: 'JD100',
        title: '¥100 Off Electronics',
        description: 'Save ¥100 on electronics over ¥1000.',
        discountType: 'FIXED' as const,
        discountValue: 100,
        minOrderValue: 1000,
        terms: 'Electronics only.',
      },
    ],
  },

  // === FOOD & DELIVERY ===
  {
    name: 'Uber Eats',
    domains: ['ubereats.com', 'www.ubereats.com'],
    logoUrl: 'https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/logo.svg',
    coupons: [
      {
        code: 'EATS20',
        title: '$20 Off First Order',
        description: 'New users get $20 off their first Uber Eats order.',
        discountType: 'FIXED' as const,
        discountValue: 20,
        minOrderValue: 25,
        terms: 'New users only. $25 minimum.',
      },
      {
        code: 'FREEDELIVERY',
        title: 'Free Delivery on Orders $15+',
        description: 'Get free delivery on orders over $15.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 15,
        terms: 'Delivery fee waived. Service fees still apply.',
      },
    ],
  },

  // === BOOKS & MEDIA ===
  {
    name: 'Book Depository',
    domains: ['bookdepository.com', 'www.bookdepository.com'],
    logoUrl: 'https://www.bookdepository.com/images/logo.png',
    coupons: [
      {
        code: 'FREESHIP',
        title: 'Free Worldwide Shipping',
        description: 'Free delivery worldwide on all books.',
        discountType: 'FREE_SHIPPING' as const,
        discountValue: 0,
        minOrderValue: 0,
        terms: 'All books ship free worldwide.',
      },
    ],
  },
];

async function seed() {
  console.log('🌍 Seeding GLOBAL merchants and coupons...\n');

  for (const merchantData of globalMerchants) {
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
          score: 80, // Global merchants get high starting scores
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
  console.log('║      🎉 Global Seeding Complete!          ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  Total Merchants: ${totalMerchants.toString().padEnd(23)} ║`);
  console.log(`║  Total Coupons: ${totalCoupons.toString().padEnd(25)} ║`);
  console.log('║                                           ║');
  console.log('║  Top Categories:                          ║');
  console.log('║  - Fashion: SHEIN, Zara, ASOS, H&M        ║');
  console.log('║  - Marketplace: Amazon, eBay, AliExpress  ║');
  console.log('║  - Beauty: Sephora, Ulta                  ║');
  console.log('║  - Tech: Apple, Best Buy, Newegg          ║');
  console.log('║  - Sports: Nike, Adidas                   ║');
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
