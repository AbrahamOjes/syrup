import { PrismaClient } from '@prisma/client';
import { MerchantResponse, MerchantListResponse } from '../types';
import { cacheService } from './cache';
import { config } from '../config';

const prisma = new PrismaClient();

export class MerchantService {
  /**
   * List all merchants
   */
  async listMerchants(): Promise<MerchantListResponse> {
    // Check cache first
    const cacheKey = 'merchants:all';
    const cached = await cacheService.get<MerchantListResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const merchants = await prisma.merchant.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const total = await prisma.merchant.count();

    // Transform to API response format
    const merchantList: MerchantResponse[] = merchants.map(merchant => ({
      merchant_name: merchant.name,
      domains: merchant.domains,
    }));

    const result: MerchantListResponse = {
      merchants: merchantList,
      total,
    };

    // Cache the result
    await cacheService.set(cacheKey, result, config.cache.merchantsTTL);

    return result;
  }

  /**
   * Create a new merchant
   */
  async createMerchant(data: {
    name: string;
    domains: string[];
    logoUrl?: string;
  }) {
    const merchant = await prisma.merchant.create({
      data,
    });

    // Invalidate cache
    await cacheService.del('merchants:all');

    return merchant;
  }

  /**
   * Add coupon to merchant
   */
  async addCoupon(merchantId: number, couponData: {
    code: string;
    title: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED' | 'BOGO' | 'FREE_SHIPPING';
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    terms?: string;
    expiresAt?: Date;
  }) {
    const coupon = await prisma.coupon.create({
      data: {
        ...couponData,
        merchantId,
        score: 50, // Default score for new coupons
      },
    });

    // Invalidate cache for this merchant's domains
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (merchant) {
      merchant.domains.forEach(domain => {
        cacheService.del(`coupons:${domain}:*`);
      });
    }

    return coupon;
  }
}

export const merchantService = new MerchantService();
