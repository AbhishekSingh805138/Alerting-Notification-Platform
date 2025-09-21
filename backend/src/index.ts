import { buildApp } from './app';
import { env } from './config/env';
import { AppDataSource } from './data-source';

const start = async () => {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection initialized.');

    const app = buildApp();
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void start();
