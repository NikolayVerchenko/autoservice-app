import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { TelegramSessionState } from './telegram-session.enums';

@Entity('telegram_sessions')
export class TelegramSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  activeDefectId: string | null;

  @Column({ type: 'uuid', nullable: true })
  activeComplaintId: string | null;

  @Column({ type: 'enum', enum: TelegramSessionState, default: TelegramSessionState.IDLE })
  state: TelegramSessionState;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
