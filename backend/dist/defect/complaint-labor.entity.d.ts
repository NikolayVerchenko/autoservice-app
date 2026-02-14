import { DefectComplaint } from './defect-complaint.entity';
export declare class ComplaintLabor {
    id: string;
    complaintId: string;
    complaint: DefectComplaint;
    name: string;
    qty: number;
    priceRub: number;
    createdAt: Date;
    updatedAt: Date;
}
