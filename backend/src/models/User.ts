import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Repository } from './Repository';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  githubId!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true, select: false })
  githubAccessToken?: string;

  @Column({ default: 'free' })
  plan!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Repository, (repo) => repo.user)
  repositories!: Repository[];
}
