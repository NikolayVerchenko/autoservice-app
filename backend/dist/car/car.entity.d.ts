import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
export declare class Car {
    id: string;
    clientId: string;
    client: Client;
    defects: Defect[];
    brand: string;
    model: string;
    year: number | null;
    vin: string | null;
    plate: string | null;
    mileage: number | null;
    createdAt: Date;
    updatedAt: Date;
}
