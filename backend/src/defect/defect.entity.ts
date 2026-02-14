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
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { DefectStatus } from './defect.enums';
import { DefectComplaint } from './defect-complaint.entity';

@Entity('defects')
export class Defect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({ type: 'uuid', nullable: false })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.defects, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'uuid', nullable: false })
  carId: string;

  @ManyToOne(() => Car, (car) => car.defects, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedMechanicId: string | null;

  @Column({
    type: 'enum',
    enum: DefectStatus,
    default: DefectStatus.DRAFT,
  })
  status: DefectStatus;

  @Column({ type: 'date', nullable: true })
  plannedVisitDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  publicShareToken: string | null;

  @OneToMany(() => DefectComplaint, (complaint) => complaint.defect, {
    cascade: ['insert', 'update'],
  })
  complaints: DefectComplaint[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
