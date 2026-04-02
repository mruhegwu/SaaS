import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Analysis } from './Analysis';
import { Pipeline } from './Pipeline';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  githubId!: string;

  @Column()
  name!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  language!: string;

  @Column({ default: false })
  private!: boolean;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.repositories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Analysis, (analysis) => analysis.repository)
  analyses!: Analysis[];

  @OneToMany(() => Pipeline, (pipeline) => pipeline.repository)
  pipelines!: Pipeline[];
}
