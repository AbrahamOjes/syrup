import { Request, Response } from 'express';
import { VersionResponse } from '../types';
import { config } from '../config';

export const getVersion = (req: Request, res: Response) => {
  const response: VersionResponse = {
    version: config.apiVersion,
    provider: config.providerName,
  };

  res.json(response);
};
