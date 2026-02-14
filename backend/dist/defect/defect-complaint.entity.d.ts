import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { Defect } from './defect.entity';
import { ApprovalStatus, DiagnosticStatus } from './defect.enums';
export declare class DefectComplaint {
    id: string;
    defectId: string;
    defect: Defect;
    idx: number;
    complaintText: string;
    diagnosticText: string | null;
    diagnosticStatus: DiagnosticStatus;
    approvalStatus: ApprovalStatus;
    labors: ComplaintLabor[];
    parts: ComplaintPart[];
    createdAt: Date;
    updatedAt: Date;
}
