import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { Car } from './car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';
import { UpdateCarDto } from './dto/update-car.dto';

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

  async update(id: string, dto: UpdateCarDto): Promise<Car> {
    const car = await this.findOne(id);

    if (typeof dto.clientId === 'string') {
      await this.clientService.findOne(dto.clientId);
      car.clientId = dto.clientId;
    }

    if (typeof dto.brand === 'string') {
      car.brand = dto.brand;
    }

    if (typeof dto.model === 'string') {
      car.model = dto.model;
    }

    if (typeof dto.year === 'number') {
      car.year = dto.year;
    }

    if (typeof dto.vin === 'string') {
      car.vin = dto.vin.trim() || null;
    }

    if (typeof dto.plate === 'string') {
      car.plate = dto.plate.trim() || null;
    }

    if (typeof dto.mileage === 'number') {
      car.mileage = dto.mileage;
    }

    return this.carRepository.save(car);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const car = await this.findOne(id);
    await this.carRepository.remove(car);
    return { deleted: true };
  }
}
