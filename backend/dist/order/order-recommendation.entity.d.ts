import { Order } from './order.entity';
export declare class OrderRecommendation {
    id: string;
    orderId: string;
    order: Order;
    sourceComplaintId: string | null;
    text: string;
    estTotalRub: number | null;
    createdAt: Date;
    updatedAt: Date;
}
