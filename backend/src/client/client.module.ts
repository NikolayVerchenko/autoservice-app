import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointment/appointment.entity';
import { Car } from '../car/car.entity';
import { Defect } from '../defect/defect.entity';
import { SettingsModule } from '../settings/settings.module';
import { ClientController } from './client.controller';
import { Client } from './client.entity';
import { ClientService } from './client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Car, Defect, Appointment]), SettingsModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
