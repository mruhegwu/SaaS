import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Repository } from './Repository';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  githubId!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  accessToken!: string;

  @Column({ nullable: true })
  avatarUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Repository, (repo) => repo.user)
  repositories!: Repository[];
}
