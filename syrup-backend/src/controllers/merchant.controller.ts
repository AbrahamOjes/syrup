import { Request, Response, NextFunction } from 'express';
import { merchantService } from '../services/merchant.service';

export const listMerchants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await merchantService.listMerchants();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
