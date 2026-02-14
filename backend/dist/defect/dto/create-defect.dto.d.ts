export declare class CreateDefectComplaintDto {
    complaintText: string;
}
export declare class CreateDefectDto {
    clientId: string;
    carId: string;
    complaints: CreateDefectComplaintDto[];
}
