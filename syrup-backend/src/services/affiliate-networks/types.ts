// Shared types for affiliate network integrations

export interface AffiliateCoupon {
  merchantId: string;
  merchantName: string;
  merchantDomain?: string;
  couponCode: string;
  dealTitle: string;
  dealDescription: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'BOGO';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  couponUrl: string;
  terms?: string;
}

export interface AffiliateMerchant {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  category?: string;
}

export interface AffiliateNetworkConfig {
  apiKey?: string;
  apiSecret?: string;
  affiliateId?: string;
  baseUrl?: string;
}

export interface ImportResult {
  merchantsImported: number;
  couponsImported: number;
  errors: string[];
  duration: number;
}
