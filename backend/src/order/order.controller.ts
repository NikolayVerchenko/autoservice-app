import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Controller('defects')
export class DefectOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(':id/create-order')
  createOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.createFromDefect(id);
  }
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Get()
  findAll(@Query('defectId') defectId?: string): Promise<Order[]> {
    return this.orderService.findAll(defectId);
  }
}
