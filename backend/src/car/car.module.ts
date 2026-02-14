import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { CarController } from './car.controller';
import { Car } from './car.entity';
import { CarService } from './car.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car]), ClientModule],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
