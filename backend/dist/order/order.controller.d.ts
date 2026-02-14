import { OrderService } from './order.service';
import { Order } from './order.entity';
export declare class DefectOrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(id: string): Promise<Order>;
}
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    findOne(id: string): Promise<Order>;
    findAll(defectId?: string): Promise<Order[]>;
}
