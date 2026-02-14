"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const telegram_module_1 = require("../telegram/telegram.module");
const car_entity_1 = require("../car/car.entity");
const client_entity_1 = require("../client/client.entity");
const user_entity_1 = require("../user/user.entity");
const complaint_labor_entity_1 = require("./complaint-labor.entity");
const complaint_part_entity_1 = require("./complaint-part.entity");
const counter_entity_1 = require("./counter.entity");
const defect_controller_1 = require("./defect.controller");
const defect_complaint_entity_1 = require("./defect-complaint.entity");
const defect_entity_1 = require("./defect.entity");
const defect_service_1 = require("./defect.service");
let DefectModule = class DefectModule {
};
exports.DefectModule = DefectModule;
exports.DefectModule = DefectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            telegram_module_1.TelegramModule,
            typeorm_1.TypeOrmModule.forFeature([
                defect_entity_1.Defect,
                defect_complaint_entity_1.DefectComplaint,
                complaint_labor_entity_1.ComplaintLabor,
                complaint_part_entity_1.ComplaintPart,
                counter_entity_1.Counter,
                client_entity_1.Client,
                car_entity_1.Car,
                user_entity_1.User,
            ]),
        ],
        controllers: [defect_controller_1.DefectController, defect_controller_1.ComplaintController, defect_controller_1.ComplaintLaborController, defect_controller_1.ComplaintPartController],
        providers: [defect_service_1.DefectService],
        exports: [defect_service_1.DefectService, typeorm_1.TypeOrmModule],
    })
], DefectModule);
//# sourceMappingURL=defect.module.js.map