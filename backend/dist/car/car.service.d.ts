import { Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { Car } from './car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';
export declare class CarService {
    private readonly carRepository;
    private readonly clientService;
    constructor(carRepository: Repository<Car>, clientService: ClientService);
    create(createCarDto: CreateCarDto): Promise<Car>;
    findAll(query: FindCarsQueryDto): Promise<Car[]>;
    findOne(id: string): Promise<Car>;
}
