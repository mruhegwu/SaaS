import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Repository } from './Repository';

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

@Entity('analyses')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  repositoryId!: string;

  @Column({ default: 'pending' })
  status!: AnalysisStatus;

  @Column({ nullable: true, type: 'text' })
  summary!: string;

  @Column({ nullable: true, type: 'jsonb' })
  issues!: object;

  @Column({ nullable: true, type: 'jsonb' })
  suggestions!: object;

  @Column({ nullable: true, type: 'float' })
  codeQualityScore!: number;

  @Column({ nullable: true, type: 'float' })
  techDebt!: number;

  @Column({ nullable: true, type: 'jsonb' })
  securityRisks!: object;

  @Column({ nullable: true, type: 'float' })
  testCoverage!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Repository, (repo) => repo.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repositoryId' })
  repository!: Repository;
}
