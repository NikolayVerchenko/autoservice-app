import { Order } from './order.entity';
export declare class OrderPart {
    id: string;
    orderId: string;
    order: Order;
    sourceComplaintId: string | null;
    name: string;
    qty: number;
    priceRub: number;
    fromStock: boolean;
    createdAt: Date;
    updatedAt: Date;
}
