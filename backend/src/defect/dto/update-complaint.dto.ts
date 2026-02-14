import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus, DiagnosticStatus } from '../defect.enums';

export class UpdateComplaintDto {
  @IsOptional()
  @IsString()
  complaintText?: string;

  @IsOptional()
  @IsString()
  diagnosticText?: string;

  @IsOptional()
  @IsEnum(DiagnosticStatus)
  diagnosticStatus?: DiagnosticStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;
}
