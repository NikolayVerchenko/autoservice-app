import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
import { AppointmentStatus } from './appointment.enums';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'uuid', nullable: false })
  carId: string;

  @ManyToOne(() => Car, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'uuid', nullable: true })
  defectId: string | null;

  @ManyToOne(() => Defect, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'defectId' })
  defect: Defect | null;

  @Column({ type: 'timestamp', nullable: false })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: false })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PLANNED,
  })
  status: AppointmentStatus;

  @Column({ type: 'varchar', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
