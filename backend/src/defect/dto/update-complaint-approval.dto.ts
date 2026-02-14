import { IsEnum } from 'class-validator';
import { ApprovalStatus } from '../defect.enums';

export class UpdateComplaintApprovalDto {
  @IsEnum(ApprovalStatus)
  approvalStatus: ApprovalStatus;
}
