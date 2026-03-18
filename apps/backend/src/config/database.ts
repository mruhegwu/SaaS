import { DataSource } from 'typeorm';
import { config } from './index';
import { User } from '../models/user.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  entities: [User],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
});

export const initializeDatabase = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};
