import dotenv from 'dotenv';
import { CouponAPIIntegration } from '../src/services/affiliate-networks/coupon-api';

dotenv.config();

/**
 * Import merchants and coupons from CouponAPI.org
 *
 * Setup:
 * 1. Sign up at https://couponapi.org/
 * 2. Get your API key
 * 3. Add to .env: COUPONAPI_KEY=your_key_here
 * 4. Run: npm run import:couponapi
 *
 * Expected results:
 * - Free tier (100 req/day): ~100 merchants in 10 minutes
 * - Starter ($29/mo): ~1000 merchants in 1-2 hours
 * - Pro ($99/mo): ~5000+ merchants in 3-4 hours
 */

async function main() {
  const apiKey = process.env.COUPONAPI_KEY;

  if (!apiKey) {
    console.error('❌ Error: COUPONAPI_KEY not found in environment variables');
    console.log('\n📝 Setup instructions:');
    console.log('1. Sign up at https://couponapi.org/');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Add to .env file: COUPONAPI_KEY=your_key_here');
    console.log('4. Run: npm run import:couponapi\n');
    process.exit(1);
  }

  const integration = new CouponAPIIntegration(apiKey);

  // Import all merchants (adjust limit based on your plan)
  const maxMerchants = parseInt(process.env.IMPORT_LIMIT || '1000', 10);

  console.log(`🎯 Target: ${maxMerchants} merchants`);
  console.log('⏱️  This may take 1-2 hours depending on your API plan\n');

  const result = await integration.importAll(maxMerchants);

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    result.errors.slice(0, 10).forEach((error) => console.log(`  - ${error}`));
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  console.log('\n✅ Import completed successfully!');
  console.log(`\n💡 Next steps:`);
  console.log(`1. Test the API: curl http://localhost:3000/syrup/merchants`);
  console.log(`2. Start the server: npm run dev`);
  console.log(`3. View in Prisma Studio: npm run prisma:studio`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
