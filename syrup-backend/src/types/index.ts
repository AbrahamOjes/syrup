// Syrup API Standard v1 Types

export interface CouponResponse {
  id: string;
  title: string;
  description: string;
  code: string;
  score: number;
  copied?: boolean;
}

export interface CouponListResponse {
  coupons: CouponResponse[];
  total: number;
  merchant_name: string;
}

export interface VersionResponse {
  version: string;
  provider: string;
}

export interface SuccessResponse {
  success: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

export interface MerchantResponse {
  merchant_name: string;
  domains: string[];
}

export interface MerchantListResponse {
  merchants: MerchantResponse[];
  total: number;
}

export interface ListCouponsQuery {
  domain: string;
  limit?: number;
  offset?: number;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
}
