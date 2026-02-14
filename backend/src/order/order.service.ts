import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DefectComplaint } from '../defect/defect-complaint.entity';
import { ApprovalStatus, DefectStatus } from '../defect/defect.enums';
import { Defect } from '../defect/defect.entity';
import { OrderRecommendation } from './order-recommendation.entity';
import { OrderStatus } from './order.enums';
import { OrderPart } from './order-part.entity';
import { OrderWork } from './order-work.entity';
import { Order } from './order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Defect)
    private readonly defectRepository: Repository<Defect>,
  ) {}

  async createFromDefect(defectId: string): Promise<Order> {
    const defect = await this.defectRepository.findOne({ where: { id: defectId } });
    if (!defect) throw new NotFoundException(`Defect with id ${defectId} not found`);

    const existing = await this.orderRepository.findOne({ where: { defectId } });
    if (existing) {
      throw new ConflictException(`Order for defect ${defectId} already exists`);
    }

    const orderId = await this.dataSource.transaction(async (manager) => {
      const year = new Date().getFullYear();
      const rows = await manager.query(
        `INSERT INTO counters("key", "year", "lastValue") VALUES ($1, $2, 1)
         ON CONFLICT ("key", "year") DO UPDATE SET "lastValue" = counters."lastValue" + 1
         RETURNING "lastValue"`,
        ['ORDER', year],
      );
      const number = this.formatOrderNumber(year, Number(rows[0].lastValue));

      const complaints = await manager.find(DefectComplaint, {
        where: { defectId },
        relations: { labors: true, parts: true },
        order: { idx: 'ASC' },
      });

      const order = manager.create(Order, {
        number,
        defectId,
        status: OrderStatus.OPEN,
      });
      const savedOrder = await manager.save(Order, order);

      const works: OrderWork[] = [];
      const parts: OrderPart[] = [];
      const recommendations: OrderRecommendation[] = [];

      for (const complaint of complaints) {
        const laborTotalRub = (complaint.labors ?? []).reduce(
          (sum, item) => sum + item.qty * item.priceRub,
          0,
        );
        const partsTotalRub = (complaint.parts ?? []).reduce(
          (sum, item) => sum + item.qty * item.priceRub,
          0,
        );
        const totalRub = laborTotalRub + partsTotalRub;

        if (complaint.approvalStatus === ApprovalStatus.ORDER) {
          for (const labor of complaint.labors ?? []) {
            works.push(
              manager.create(OrderWork, {
                orderId: savedOrder.id,
                sourceComplaintId: complaint.id,
                name: labor.name,
                qty: labor.qty,
                priceRub: labor.priceRub,
              }),
            );
          }

          for (const part of complaint.parts ?? []) {
            parts.push(
              manager.create(OrderPart, {
                orderId: savedOrder.id,
                sourceComplaintId: complaint.id,
                name: part.name,
                qty: part.qty,
                priceRub: part.priceRub,
                fromStock: part.fromStock,
              }),
            );
          }
        }

        if (complaint.approvalStatus === ApprovalStatus.RECOMMENDATION) {
          const text = complaint.diagnosticText
            ? `${complaint.complaintText} / ${complaint.diagnosticText}`
            : complaint.complaintText;

          recommendations.push(
            manager.create(OrderRecommendation, {
              orderId: savedOrder.id,
              sourceComplaintId: complaint.id,
              text,
              estTotalRub: totalRub,
            }),
          );
        }
      }

      if (works.length > 0) await manager.save(OrderWork, works);
      if (parts.length > 0) await manager.save(OrderPart, parts);
      if (recommendations.length > 0) await manager.save(OrderRecommendation, recommendations);

      defect.status = DefectStatus.ORDER_CREATED;
      await manager.save(Defect, defect);

      return savedOrder.id;
    });

    return this.findOne(orderId);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { defect: true, works: true, parts: true, recommendations: true },
      order: {
        works: { createdAt: 'ASC' },
        parts: { createdAt: 'ASC' },
        recommendations: { createdAt: 'ASC' },
      },
    });

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async findAll(defectId?: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: defectId ? { defectId } : {},
      relations: { defect: true, works: true, parts: true, recommendations: true },
      order: { createdAt: 'DESC' },
    });
  }

  private formatOrderNumber(year: number, value: number): string {
    return `ЗН-${year}-${String(value).padStart(6, '0')}`;
  }
}
