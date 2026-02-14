import { ApprovalStatus, DiagnosticStatus } from '../defect.enums';
export declare class UpdateComplaintDto {
    complaintText?: string;
    diagnosticText?: string;
    diagnosticStatus?: DiagnosticStatus;
    approvalStatus?: ApprovalStatus;
}
