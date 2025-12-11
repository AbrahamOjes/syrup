import { Router } from 'express';
import { getVersion } from '../controllers/version.controller';
import {
  listCoupons,
  reportValidCoupon,
  reportInvalidCoupon,
} from '../controllers/coupon.controller';
import { listMerchants } from '../controllers/merchant.controller';

const router = Router();

// Syrup API Standard v1 Routes
// Base path: /syrup

// Version endpoint
router.get('/version', getVersion);

// Coupons endpoints
router.get('/coupons', listCoupons);
router.post('/coupons/valid/:id', reportValidCoupon);
router.post('/coupons/invalid/:id', reportInvalidCoupon);

// Merchants endpoint
router.get('/merchants', listMerchants);

export default router;
