import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class Settings {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  publicBotUsername: string | null;

  @Column({ type: 'varchar', nullable: true })
  publicAppUrl: string | null;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
