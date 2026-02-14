import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Defect } from '../defect/defect.entity';
import { OrderRecommendation } from './order-recommendation.entity';
import { OrderStatus } from './order.enums';
import { OrderPart } from './order-part.entity';
import { OrderWork } from './order-work.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  defectId: string;

  @OneToOne(() => Defect, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'defectId' })
  defect: Defect;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: OrderStatus;

  @OneToMany(() => OrderWork, (work) => work.order, { cascade: ['insert', 'update'] })
  works: OrderWork[];

  @OneToMany(() => OrderPart, (part) => part.order, { cascade: ['insert', 'update'] })
  parts: OrderPart[];

  @OneToMany(() => OrderRecommendation, (recommendation) => recommendation.order, {
    cascade: ['insert', 'update'],
  })
  recommendations: OrderRecommendation[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
