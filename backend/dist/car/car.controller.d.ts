import { Car } from './car.entity';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';
export declare class CarController {
    private readonly carService;
    constructor(carService: CarService);
    create(createCarDto: CreateCarDto): Promise<Car>;
    findAll(query: FindCarsQueryDto): Promise<Car[]>;
    findOne(id: string): Promise<Car>;
}
