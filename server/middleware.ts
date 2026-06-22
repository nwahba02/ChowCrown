import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncRoute(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// Must be registered with 4 params so Express identifies it as an error handler.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[error]', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
