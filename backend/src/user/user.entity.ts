import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user.enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole, nullable: false })
  role: UserRole;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  login: string;

  @Column({ type: 'varchar', nullable: false })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  telegramUserId: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
