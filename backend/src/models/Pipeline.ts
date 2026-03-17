import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Repository } from './Repository';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  techStack!: string;

  @Column({ default: 'draft' })
  status!: string;

  @Column({ nullable: true })
  prUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Repository, (repo) => repo.pipelines)
  repository!: Repository;
}
