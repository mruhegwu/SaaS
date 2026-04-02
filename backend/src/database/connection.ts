import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Analysis } from '../models/Analysis';
import { Pipeline } from '../models/Pipeline';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Repository, Analysis, Pipeline],
  migrations: [],
  subscribers: [],
});
