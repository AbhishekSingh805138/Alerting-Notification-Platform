import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';

export const buildApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/admin', adminRoutes);
  app.use(userRoutes);

  app.use(errorHandler);

  return app;
};
