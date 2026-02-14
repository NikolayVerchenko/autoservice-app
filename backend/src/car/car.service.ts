import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { Car } from './car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly clientService: ClientService,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    await this.clientService.findOne(createCarDto.clientId);

    const car = this.carRepository.create(createCarDto);
    return this.carRepository.save(car);
  }

  findAll(query: FindCarsQueryDto): Promise<Car[]> {
    return this.carRepository.find({
      where: query.clientId ? { clientId: query.clientId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({ where: { id } });

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    return car;
  }
}
