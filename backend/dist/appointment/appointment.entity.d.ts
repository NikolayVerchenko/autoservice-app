import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
import { AppointmentStatus } from './appointment.enums';
export declare class Appointment {
    id: string;
    clientId: string;
    client: Client;
    carId: string;
    car: Car;
    defectId: string | null;
    defect: Defect | null;
    startAt: Date;
    endAt: Date;
    status: AppointmentStatus;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
}
