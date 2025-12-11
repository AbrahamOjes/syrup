import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication if not required
  if (!config.apiKey.required) {
    return next();
  }

  const apiKey = req.headers['x-syrup-api-key'] as string;

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
  }

  // Validate API key
  if (!config.apiKey.validKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  next();
};
