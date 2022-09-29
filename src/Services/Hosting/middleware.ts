import { NextFunction, Request, Response } from 'express';

export type HostingMiddleware = {
  checkForApiKey(req: Request, res: Response, next: NextFunction): void;
};

export type HostingMiddlewareFactory = () => HostingMiddleware;

export const HostingMiddleware: HostingMiddlewareFactory = () => ({
  checkForApiKey(req: any, res: Response, next: NextFunction) {
    const { apiKey } = req.query;
    if (process.env.LEGACY_API_KEY && process.env.LEGACY_API_KEY === 'true') {
      req.apiKey = 'legacy';
      return next();
    }

    if (!apiKey)
      return res
        .status(500)
        .send('Missing api key. Please provide your api key on all requests.');
    req.apiKey = apiKey;
    next();
  },
});
