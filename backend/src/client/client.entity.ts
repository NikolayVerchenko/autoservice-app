import { Defect } from '../defect/defect.entity';
import { Car } from '../car/car.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  telegramUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  tgInviteToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  tgLinkedAt: Date | null;

  @OneToMany(() => Car, (car) => car.client)
  cars: Car[];

  @Column({ type: 'uuid', nullable: true })
  primaryCarId: string | null;

  @ManyToOne(() => Car, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'primaryCarId' })
  primaryCar: Car | null;

  @OneToMany(() => Defect, (defect) => defect.client)
  defects: Defect[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
