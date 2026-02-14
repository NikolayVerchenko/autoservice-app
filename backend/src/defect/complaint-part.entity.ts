import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DefectComplaint } from './defect-complaint.entity';

@Entity('complaint_parts')
export class ComplaintPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  complaintId: string;

  @ManyToOne(() => DefectComplaint, (complaint) => complaint.parts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'complaintId' })
  complaint: DefectComplaint;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  qty: number;

  @Column({ type: 'int', nullable: false })
  priceRub: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  fromStock: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
