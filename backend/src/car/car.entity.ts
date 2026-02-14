import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
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

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.cars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => Defect, (defect) => defect.car)
  defects: Defect[];

  @Column({ type: 'varchar', nullable: false })
  brand: string;

  @Column({ type: 'varchar', nullable: false })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'varchar', nullable: true })
  vin: string | null;

  @Column({ type: 'varchar', nullable: true })
  plate: string | null;

  @Column({ type: 'int', nullable: true })
  mileage: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
