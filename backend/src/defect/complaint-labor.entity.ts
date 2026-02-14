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

@Entity('complaint_labors')
export class ComplaintLabor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  complaintId: string;

  @ManyToOne(() => DefectComplaint, (complaint) => complaint.labors, {
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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
