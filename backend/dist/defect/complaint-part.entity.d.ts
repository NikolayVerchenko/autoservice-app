import { DefectComplaint } from './defect-complaint.entity';
export declare class ComplaintPart {
    id: string;
    complaintId: string;
    complaint: DefectComplaint;
    name: string;
    qty: number;
    priceRub: number;
    fromStock: boolean;
    createdAt: Date;
    updatedAt: Date;
}
