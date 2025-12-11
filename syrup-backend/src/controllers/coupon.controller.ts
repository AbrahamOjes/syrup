import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service';
import { SuccessResponse } from '../types';

export const listCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { domain, limit, offset } = req.query;

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Domain parameter is required',
      });
    }

    const result = await couponService.listCoupons({
      domain,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const reportValidCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Coupon ID is required',
      });
    }

    await couponService.reportValid(id, {
      userId: req.body?.userId,
      orderValue: req.body?.orderValue,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const response: SuccessResponse = {
      success: 'Coupon reported as valid',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const reportInvalidCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Coupon ID is required',
      });
    }

    await couponService.reportInvalid(id, {
      userId: req.body?.userId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const response: SuccessResponse = {
      success: 'Coupon reported as invalid',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
