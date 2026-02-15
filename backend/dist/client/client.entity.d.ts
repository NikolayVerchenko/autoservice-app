import { Defect } from '../defect/defect.entity';
import { Car } from '../car/car.entity';
export declare class Client {
    id: string;
    name: string;
    phone: string;
    telegramUserId: string | null;
    tgInviteToken: string | null;
    tgLinkedAt: Date | null;
    cars: Car[];
    primaryCarId: string | null;
    primaryCar: Car | null;
    defects: Defect[];
    createdAt: Date;
    updatedAt: Date;
}
