"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const defect_complaint_entity_1 = require("../defect/defect-complaint.entity");
const defect_enums_1 = require("../defect/defect.enums");
const defect_entity_1 = require("../defect/defect.entity");
const order_recommendation_entity_1 = require("./order-recommendation.entity");
const order_enums_1 = require("./order.enums");
const order_part_entity_1 = require("./order-part.entity");
const order_work_entity_1 = require("./order-work.entity");
const order_entity_1 = require("./order.entity");
let OrderService = class OrderService {
    dataSource;
    orderRepository;
    defectRepository;
    constructor(dataSource, orderRepository, defectRepository) {
        this.dataSource = dataSource;
        this.orderRepository = orderRepository;
        this.defectRepository = defectRepository;
    }
    async createFromDefect(defectId) {
        const defect = await this.defectRepository.findOne({ where: { id: defectId } });
        if (!defect)
            throw new common_1.NotFoundException(`Defect with id ${defectId} not found`);
        const existing = await this.orderRepository.findOne({ where: { defectId } });
        if (existing) {
            throw new common_1.ConflictException(`Order for defect ${defectId} already exists`);
        }
        const orderId = await this.dataSource.transaction(async (manager) => {
            const year = new Date().getFullYear();
            const rows = await manager.query(`INSERT INTO counters("key", "year", "lastValue") VALUES ($1, $2, 1)
         ON CONFLICT ("key", "year") DO UPDATE SET "lastValue" = counters."lastValue" + 1
         RETURNING "lastValue"`, ['ORDER', year]);
            const number = this.formatOrderNumber(year, Number(rows[0].lastValue));
            const complaints = await manager.find(defect_complaint_entity_1.DefectComplaint, {
                where: { defectId },
                relations: { labors: true, parts: true },
                order: { idx: 'ASC' },
            });
            const order = manager.create(order_entity_1.Order, {
                number,
                defectId,
                status: order_enums_1.OrderStatus.OPEN,
            });
            const savedOrder = await manager.save(order_entity_1.Order, order);
            const works = [];
            const parts = [];
            const recommendations = [];
            for (const complaint of complaints) {
                const laborTotalRub = (complaint.labors ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);
                const partsTotalRub = (complaint.parts ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);
                const totalRub = laborTotalRub + partsTotalRub;
                if (complaint.approvalStatus === defect_enums_1.ApprovalStatus.ORDER) {
                    for (const labor of complaint.labors ?? []) {
                        works.push(manager.create(order_work_entity_1.OrderWork, {
                            orderId: savedOrder.id,
                            sourceComplaintId: complaint.id,
                            name: labor.name,
                            qty: labor.qty,
                            priceRub: labor.priceRub,
                        }));
                    }
                    for (const part of complaint.parts ?? []) {
                        parts.push(manager.create(order_part_entity_1.OrderPart, {
                            orderId: savedOrder.id,
                            sourceComplaintId: complaint.id,
                            name: part.name,
                            qty: part.qty,
                            priceRub: part.priceRub,
                            fromStock: part.fromStock,
                        }));
                    }
                }
                if (complaint.approvalStatus === defect_enums_1.ApprovalStatus.RECOMMENDATION) {
                    const text = complaint.diagnosticText
                        ? `${complaint.complaintText} / ${complaint.diagnosticText}`
                        : complaint.complaintText;
                    recommendations.push(manager.create(order_recommendation_entity_1.OrderRecommendation, {
                        orderId: savedOrder.id,
                        sourceComplaintId: complaint.id,
                        text,
                        estTotalRub: totalRub,
                    }));
                }
            }
            if (works.length > 0)
                await manager.save(order_work_entity_1.OrderWork, works);
            if (parts.length > 0)
                await manager.save(order_part_entity_1.OrderPart, parts);
            if (recommendations.length > 0)
                await manager.save(order_recommendation_entity_1.OrderRecommendation, recommendations);
            defect.status = defect_enums_1.DefectStatus.ORDER_CREATED;
            await manager.save(defect_entity_1.Defect, defect);
            return savedOrder.id;
        });
        return this.findOne(orderId);
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: { defect: true, works: true, parts: true, recommendations: true },
            order: {
                works: { createdAt: 'ASC' },
                parts: { createdAt: 'ASC' },
                recommendations: { createdAt: 'ASC' },
            },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order with id ${id} not found`);
        return order;
    }
    async findAll(defectId) {
        return this.orderRepository.find({
            where: defectId ? { defectId } : {},
            relations: { defect: true, works: true, parts: true, recommendations: true },
            order: { createdAt: 'DESC' },
        });
    }
    formatOrderNumber(year, value) {
        return `ЗН-${year}-${String(value).padStart(6, '0')}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(defect_entity_1.Defect)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
//# sourceMappingURL=order.service.js.map