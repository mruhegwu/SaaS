import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Repository } from './Repository';

export type PipelineStatus = 'draft' | 'deployed' | 'failed';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  repositoryId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  yamlContent!: string;

  @Column({ default: 'draft' })
  status!: PipelineStatus;

  @Column({ nullable: true })
  prUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Repository, (repo) => repo.pipelines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repositoryId' })
  repository!: Repository;
}
