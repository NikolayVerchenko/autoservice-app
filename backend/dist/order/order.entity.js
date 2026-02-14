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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const defect_entity_1 = require("../defect/defect.entity");
const order_recommendation_entity_1 = require("./order-recommendation.entity");
const order_enums_1 = require("./order.enums");
const order_part_entity_1 = require("./order-part.entity");
const order_work_entity_1 = require("./order-work.entity");
let Order = class Order {
    id;
    number;
    defectId;
    defect;
    status;
    works;
    parts;
    recommendations;
    createdAt;
    updatedAt;
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "defectId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => defect_entity_1.Defect, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'defectId' }),
    __metadata("design:type", defect_entity_1.Defect)
], Order.prototype, "defect", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: order_enums_1.OrderStatus, default: order_enums_1.OrderStatus.OPEN }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_work_entity_1.OrderWork, (work) => work.order, { cascade: ['insert', 'update'] }),
    __metadata("design:type", Array)
], Order.prototype, "works", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_part_entity_1.OrderPart, (part) => part.order, { cascade: ['insert', 'update'] }),
    __metadata("design:type", Array)
], Order.prototype, "parts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_recommendation_entity_1.OrderRecommendation, (recommendation) => recommendation.order, {
        cascade: ['insert', 'update'],
    }),
    __metadata("design:type", Array)
], Order.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map