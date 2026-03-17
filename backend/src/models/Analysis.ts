import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Repository } from './Repository';

@Entity('analyses')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'jsonb', nullable: true })
  codeQuality?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  securityIssues?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  improvements?: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ nullable: true })
  overallScore?: number;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Repository, (repo) => repo.analyses)
  repository!: Repository;
}
