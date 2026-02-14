import { DataSource, Repository } from 'typeorm';
import { Defect } from '../defect/defect.entity';
import { Order } from './order.entity';
export declare class OrderService {
    private readonly dataSource;
    private readonly orderRepository;
    private readonly defectRepository;
    constructor(dataSource: DataSource, orderRepository: Repository<Order>, defectRepository: Repository<Defect>);
    createFromDefect(defectId: string): Promise<Order>;
    findOne(id: string): Promise<Order>;
    findAll(defectId?: string): Promise<Order[]>;
    private formatOrderNumber;
}
