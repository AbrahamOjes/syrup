import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { AffiliateCoupon, ImportResult } from './types';

const prisma = new PrismaClient();

/**
 * CouponAPI.org Integration
 * Aggregates coupons from ShareASale, CJ, Rakuten, Impact, and more
 *
 * Pricing:
 * - Free: 100 requests/day
 * - Starter ($29/mo): 1,000 requests/day
 * - Pro ($99/mo): 10,000 requests/day
 *
 * Get API key at: https://couponapi.org/
 */

export class CouponAPIIntegration {
  private apiKey: string;
  private baseUrl = 'https://couponapi.org/api';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('CouponAPI.org API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Fetch all available merchants
   */
  async fetchMerchants(limit: number = 1000): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/merchants`, {
        params: {
          apikey: this.apiKey,
          limit,
        },
        timeout: 30000,
      });

      console.log(`✅ Fetched ${response.data.merchants?.length || 0} merchants`);
      return response.data.merchants || [];
    } catch (error: any) {
      console.error('❌ Error fetching merchants:', error.message);
      throw error;
    }
  }

  /**
   * Fetch coupons for a specific merchant
   */
  async fetchMerchantCoupons(merchantName: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/coupons`, {
        params: {
          apikey: this.apiKey,
          merchant: merchantName,
        },
        timeout: 15000,
      });

      return response.data.coupons || [];
    } catch (error: any) {
      console.error(`❌ Error fetching coupons for ${merchantName}:`, error.message);
      return [];
    }
  }

  /**
   * Import all merchants and coupons into database
   */
  async importAll(maxMerchants: number = 1000): Promise<ImportResult> {
    const startTime = Date.now();
    let merchantsImported = 0;
    let couponsImported = 0;
    const errors: string[] = [];

    console.log('🚀 Starting CouponAPI.org import...\n');

    try {
      // Fetch all merchants
      const merchants = await this.fetchMerchants(maxMerchants);

      for (let i = 0; i < merchants.length; i++) {
        const merchant = merchants[i];

        try {
          console.log(`[${i + 1}/${merchants.length}] Importing ${merchant.name}...`);

          // Fetch coupons for this merchant
          const coupons = await this.fetchMerchantCoupons(merchant.name);

          if (coupons.length === 0) {
            console.log(`  ⚠️  No coupons found, skipping`);
            continue;
          }

          // Create or update merchant
          const dbMerchant = await prisma.merchant.upsert({
            where: { name: merchant.name },
            create: {
              name: merchant.name,
              domains: merchant.domain ? [merchant.domain] : [],
              logoUrl: merchant.logo_url,
            },
            update: {
              domains: merchant.domain ? [merchant.domain] : [],
              logoUrl: merchant.logo_url,
            },
          });

          merchantsImported++;

          // Import coupons
          for (const coupon of coupons) {
            try {
              await prisma.coupon.create({
                data: {
                  code: coupon.code || '',
                  title: coupon.title || coupon.description?.substring(0, 100),
                  description: coupon.description || coupon.title || '',
                  discountType: this.mapDiscountType(coupon.type),
                  discountValue: parseFloat(coupon.discount_amount || 0),
                  minOrderValue: parseFloat(coupon.minimum_purchase || 0) || undefined,
                  expiresAt: coupon.expiration_date ? new Date(coupon.expiration_date) : undefined,
                  merchantId: dbMerchant.id,
                  score: 75, // API coupons get good starting score
                  terms: coupon.terms_and_conditions,
                },
              });

              couponsImported++;
            } catch (couponError: any) {
              // Skip duplicate coupons
              if (!couponError.message?.includes('Unique constraint')) {
                errors.push(`Coupon error for ${merchant.name}: ${couponError.message}`);
              }
            }
          }

          console.log(`  ✅ Imported ${coupons.length} coupons`);

          // Rate limiting: wait 1 second between merchants
          await new Promise((resolve) => setTimeout(resolve, 1000));

        } catch (merchantError: any) {
          errors.push(`Merchant ${merchant.name}: ${merchantError.message}`);
          console.error(`  ❌ Error: ${merchantError.message}`);
        }
      }
    } catch (error: any) {
      errors.push(`Fatal error: ${error.message}`);
      console.error('❌ Fatal error:', error);
    }

    const duration = Date.now() - startTime;

    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║       🎉 Import Complete!                 ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log(`║  Merchants Imported: ${merchantsImported.toString().padEnd(18)} ║`);
    console.log(`║  Coupons Imported: ${couponsImported.toString().padEnd(20)} ║`);
    console.log(`║  Errors: ${errors.length.toString().padEnd(30)} ║`);
    console.log(`║  Duration: ${(duration / 1000).toFixed(0)}s ${' '.repeat(27)} ║`);
    console.log('╚═══════════════════════════════════════════╝');

    return {
      merchantsImported,
      couponsImported,
      errors,
      duration,
    };
  }

  /**
   * Map CouponAPI discount types to our schema
   */
  private mapDiscountType(type: string): 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'BOGO' {
    const normalizedType = type?.toLowerCase() || '';

    if (normalizedType.includes('percent') || normalizedType.includes('%')) {
      return 'PERCENTAGE';
    }
    if (normalizedType.includes('free') && normalizedType.includes('ship')) {
      return 'FREE_SHIPPING';
    }
    if (normalizedType.includes('bogo') || normalizedType.includes('buy one get one')) {
      return 'BOGO';
    }
    return 'FIXED';
  }
}
