import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Client, Car, Defect])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
