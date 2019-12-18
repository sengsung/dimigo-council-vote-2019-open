import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import CONF from './config';

export function wrap(asyncFn: Function) {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFn(req, res, next);
    } catch (error) {
      return next(error);
    }
  });
}

export function getUserHash(id: number): string {
  const hash = crypto.createHmac('md5', CONF.hashSort).update(id.toString()).digest("hex").toUpperCase().substr(3, 6);
  return hash;
}
