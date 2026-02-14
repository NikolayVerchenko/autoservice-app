import { Defect } from '../defect/defect.entity';
import { OrderRecommendation } from './order-recommendation.entity';
import { OrderStatus } from './order.enums';
import { OrderPart } from './order-part.entity';
import { OrderWork } from './order-work.entity';
export declare class Order {
    id: string;
    number: string;
    defectId: string;
    defect: Defect;
    status: OrderStatus;
    works: OrderWork[];
    parts: OrderPart[];
    recommendations: OrderRecommendation[];
    createdAt: Date;
    updatedAt: Date;
}
