import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { DefectComplaint } from './defect-complaint.entity';
import { Defect } from './defect.entity';
import { DefectService } from './defect.service';
import { AddComplaintDto } from './dto/add-complaint.dto';
import { AssignMechanicDto } from './dto/assign-mechanic.dto';
import { CreateComplaintLaborDto } from './dto/create-complaint-labor.dto';
import { CreateComplaintPartDto } from './dto/create-complaint-part.dto';
import { CreateDefectDto } from './dto/create-defect.dto';
import { FindDefectsQueryDto } from './dto/find-defects-query.dto';
import { UpdateComplaintApprovalDto } from './dto/update-complaint-approval.dto';
import { UpdateComplaintLaborDto } from './dto/update-complaint-labor.dto';
import { UpdateComplaintPartDto } from './dto/update-complaint-part.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
export declare class DefectController {
    private readonly defectService;
    constructor(defectService: DefectService);
    create(dto: CreateDefectDto): Promise<Defect>;
    findAll(query: FindDefectsQueryDto): Promise<Defect[]>;
    findOne(id: string): Promise<Defect>;
    addComplaint(id: string, dto: AddComplaintDto): Promise<DefectComplaint>;
    assignMechanic(id: string, dto: AssignMechanicDto): Promise<Defect>;
    sendToClient(id: string): Promise<{
        ok: true;
    }>;
}
export declare class ComplaintController {
    private readonly defectService;
    constructor(defectService: DefectService);
    update(id: string, dto: UpdateComplaintDto): Promise<DefectComplaint>;
    updateApproval(id: string, dto: UpdateComplaintApprovalDto): Promise<DefectComplaint>;
    addLabor(id: string, dto: CreateComplaintLaborDto): Promise<ComplaintLabor>;
    addPart(id: string, dto: CreateComplaintPartDto): Promise<ComplaintPart>;
}
export declare class ComplaintLaborController {
    private readonly defectService;
    constructor(defectService: DefectService);
    update(id: string, dto: UpdateComplaintLaborDto): Promise<ComplaintLabor>;
    remove(id: string): Promise<{
        deleted: true;
    }>;
}
export declare class ComplaintPartController {
    private readonly defectService;
    constructor(defectService: DefectService);
    update(id: string, dto: UpdateComplaintPartDto): Promise<ComplaintPart>;
    remove(id: string): Promise<{
        deleted: true;
    }>;
}
