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
    defects: Defect[];
    createdAt: Date;
    updatedAt: Date;
}
