import { PrismaClient } from '@prisma/client';
import { CouponResponse, CouponListResponse, ListCouponsQuery } from '../types';
import { cacheService } from './cache';
import { config } from '../config';

const prisma = new PrismaClient();

export class CouponService {
  /**
   * Calculate coupon score based on success rate and usage
   */
  private calculateScore(successCount: number, failureCount: number, usageCount: number): number {
    const totalReports = successCount + failureCount;

    if (totalReports === 0) {
      // New coupon with no reports gets a moderate score
      return 50;
    }

    // Success rate (0-100)
    const successRate = (successCount / totalReports) * 100;

    // Confidence factor based on number of reports (more reports = more confident)
    const confidenceFactor = Math.min(totalReports / 100, 1);

    // Usage bonus (frequently used coupons get a boost)
    const usageBonus = Math.min(usageCount / 50, 10);

    // Final score: weighted success rate + usage bonus
    return Math.round((successRate * confidenceFactor) + usageBonus);
  }

  /**
   * Recalculate score for a coupon
   */
  async recalculateScore(couponId: number): Promise<void> {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) return;

    const newScore = this.calculateScore(
      coupon.successCount,
      coupon.failureCount,
      coupon.usageCount
    );

    await prisma.coupon.update({
      where: { id: couponId },
      data: { score: newScore },
    });

    // Invalidate cache for this merchant's coupons
    const merchant = await prisma.merchant.findUnique({
      where: { id: coupon.merchantId },
    });

    if (merchant) {
      merchant.domains.forEach(domain => {
        cacheService.del(`coupons:${domain}`);
      });
    }
  }

  /**
   * List coupons for a specific domain
   */
  async listCoupons(query: ListCouponsQuery): Promise<CouponListResponse> {
    const { domain, limit = 20, offset = 0 } = query;

    // Check cache first
    const cacheKey = `coupons:${domain}:${limit}:${offset}`;
    const cached = await cacheService.get<CouponListResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    // Find merchant by domain
    const merchant = await prisma.merchant.findFirst({
      where: {
        domains: {
          hasSome: [domain],
        },
      },
      include: {
        coupons: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: {
            score: 'desc',
          },
          take: limit,
          skip: offset,
        },
      },
    });

    if (!merchant) {
      return {
        coupons: [],
        total: 0,
        merchant_name: domain,
      };
    }

    // Get total count
    const total = await prisma.coupon.count({
      where: {
        merchantId: merchant.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    // Transform to API response format
    const coupons: CouponResponse[] = merchant.coupons.map(coupon => ({
      id: coupon.id.toString(),
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      score: coupon.score,
    }));

    const result: CouponListResponse = {
      coupons,
      total,
      merchant_name: merchant.name,
    };

    // Cache the result
    await cacheService.set(cacheKey, result, config.cache.couponsTTL);

    return result;
  }

  /**
   * Report a coupon as valid
   */
  async reportValid(couponId: string, metadata?: {
    userId?: string;
    orderValue?: number;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    const id = parseInt(couponId, 10);

    // Create report
    await prisma.couponReport.create({
      data: {
        couponId: id,
        isValid: true,
        userId: metadata?.userId,
        orderValue: metadata?.orderValue,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    });

    // Update coupon stats
    await prisma.coupon.update({
      where: { id },
      data: {
        successCount: { increment: 1 },
        usageCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    });

    // Recalculate score
    await this.recalculateScore(id);
  }

  /**
   * Report a coupon as invalid
   */
  async reportInvalid(couponId: string, metadata?: {
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    const id = parseInt(couponId, 10);

    // Create report
    await prisma.couponReport.create({
      data: {
        couponId: id,
        isValid: false,
        userId: metadata?.userId,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    });

    // Update coupon stats
    await prisma.coupon.update({
      where: { id },
      data: {
        failureCount: { increment: 1 },
      },
    });

    // Recalculate score
    await this.recalculateScore(id);
  }
}

export const couponService = new CouponService();
