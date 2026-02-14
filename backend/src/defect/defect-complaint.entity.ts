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
import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { Defect } from './defect.entity';
import { ApprovalStatus, DiagnosticStatus } from './defect.enums';

@Entity('defect_complaints')
export class DefectComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  defectId: string;

  @ManyToOne(() => Defect, (defect) => defect.complaints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'defectId' })
  defect: Defect;

  @Column({ type: 'int', nullable: false })
  idx: number;

  @Column({ type: 'varchar', nullable: false })
  complaintText: string;

  @Column({ type: 'varchar', nullable: true })
  diagnosticText: string | null;

  @Column({
    type: 'enum',
    enum: DiagnosticStatus,
    default: DiagnosticStatus.NEED_REPLY,
  })
  diagnosticStatus: DiagnosticStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @OneToMany(() => ComplaintLabor, (labor) => labor.complaint, {
    cascade: ['insert', 'update'],
  })
  labors: ComplaintLabor[];

  @OneToMany(() => ComplaintPart, (part) => part.complaint, {
    cascade: ['insert', 'update'],
  })
  parts: ComplaintPart[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
