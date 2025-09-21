import { NextFunction, Request, Response } from 'express';

// Basic error handler that preserves useful debugging info while keeping responses consistent
export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = error instanceof Error && 'status' in error ? Number((error as any).status) : 500;

  res.status(status || 500).json({
    message,
  });
};
