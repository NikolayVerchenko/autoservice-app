"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const complaint_labor_entity_1 = require("../defect/complaint-labor.entity");
const complaint_part_entity_1 = require("../defect/complaint-part.entity");
const counter_entity_1 = require("../defect/counter.entity");
const defect_complaint_entity_1 = require("../defect/defect-complaint.entity");
const defect_entity_1 = require("../defect/defect.entity");
const order_controller_1 = require("./order.controller");
const order_recommendation_entity_1 = require("./order-recommendation.entity");
const order_part_entity_1 = require("./order-part.entity");
const order_work_entity_1 = require("./order-work.entity");
const order_entity_1 = require("./order.entity");
const order_service_1 = require("./order.service");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                order_work_entity_1.OrderWork,
                order_part_entity_1.OrderPart,
                order_recommendation_entity_1.OrderRecommendation,
                defect_entity_1.Defect,
                defect_complaint_entity_1.DefectComplaint,
                complaint_labor_entity_1.ComplaintLabor,
                complaint_part_entity_1.ComplaintPart,
                counter_entity_1.Counter,
            ]),
        ],
        controllers: [order_controller_1.DefectOrderController, order_controller_1.OrderController],
        providers: [order_service_1.OrderService],
        exports: [order_service_1.OrderService],
    })
], OrderModule);
//# sourceMappingURL=order.module.js.map