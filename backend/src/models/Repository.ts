import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Analysis } from './Analysis';
import { Pipeline } from './Pipeline';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  githubRepoId!: string;

  @Column()
  name!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  defaultBranch!: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ default: false })
  isPrivate!: boolean;

  @Column({ nullable: true })
  cloneUrl?: string;

  @Column({ nullable: true })
  htmlUrl?: string;

  @Column({ nullable: true })
  healthScore?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.repositories)
  user!: User;

  @OneToMany(() => Analysis, (analysis) => analysis.repository)
  analyses!: Analysis[];

  @OneToMany(() => Pipeline, (pipeline) => pipeline.repository)
  pipelines!: Pipeline[];
}
