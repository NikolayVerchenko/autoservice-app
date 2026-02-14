import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { DefectStatus } from './defect.enums';
import { DefectComplaint } from './defect-complaint.entity';
export declare class Defect {
    id: string;
    number: string;
    clientId: string;
    client: Client;
    carId: string;
    car: Car;
    createdByUserId: string | null;
    assignedMechanicId: string | null;
    status: DefectStatus;
    plannedVisitDate: string | null;
    publicShareToken: string | null;
    complaints: DefectComplaint[];
    createdAt: Date;
    updatedAt: Date;
}
