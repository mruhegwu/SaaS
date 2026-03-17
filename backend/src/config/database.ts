import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Analysis } from '../models/Analysis';
import { Pipeline } from '../models/Pipeline';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'github_devops',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Repository, Analysis, Pipeline],
  migrations: ['dist/migrations/*.js'],
});
