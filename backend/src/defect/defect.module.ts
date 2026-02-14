import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramModule } from '../telegram/telegram.module';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { User } from '../user/user.entity';
import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { Counter } from './counter.entity';
import {
  ComplaintController,
  ComplaintLaborController,
  ComplaintPartController,
  DefectController,
  PublicDefectController,
} from './defect.controller';
import { DefectComplaint } from './defect-complaint.entity';
import { Defect } from './defect.entity';
import { DefectService } from './defect.service';

@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([
      Defect,
      DefectComplaint,
      ComplaintLabor,
      ComplaintPart,
      Counter,
      Client,
      Car,
      User,
    ]),
  ],
  controllers: [DefectController, PublicDefectController, ComplaintController, ComplaintLaborController, ComplaintPartController],
  providers: [DefectService],
  exports: [DefectService, TypeOrmModule],
})
export class DefectModule {}
