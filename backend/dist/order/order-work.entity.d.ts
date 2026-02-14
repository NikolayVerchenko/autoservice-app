import { Order } from './order.entity';
export declare class OrderWork {
    id: string;
    orderId: string;
    order: Order;
    sourceComplaintId: string | null;
    name: string;
    qty: number;
    priceRub: number;
    createdAt: Date;
    updatedAt: Date;
}
