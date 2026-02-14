import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintLabor } from '../defect/complaint-labor.entity';
import { ComplaintPart } from '../defect/complaint-part.entity';
import { Counter } from '../defect/counter.entity';
import { DefectComplaint } from '../defect/defect-complaint.entity';
import { Defect } from '../defect/defect.entity';
import { DefectOrderController, OrderController } from './order.controller';
import { OrderRecommendation } from './order-recommendation.entity';
import { OrderPart } from './order-part.entity';
import { OrderWork } from './order-work.entity';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderWork,
      OrderPart,
      OrderRecommendation,
      Defect,
      DefectComplaint,
      ComplaintLabor,
      ComplaintPart,
      Counter,
    ]),
  ],
  controllers: [DefectOrderController, OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
