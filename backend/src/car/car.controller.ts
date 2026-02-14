import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Car } from './car.entity';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carService.create(createCarDto);
  }

  @Get()
  findAll(@Query() query: FindCarsQueryDto): Promise<Car[]> {
    return this.carService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Car> {
    return this.carService.findOne(id);
  }
}
