"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const car_entity_1 = require("../car/car.entity");
const client_entity_1 = require("../client/client.entity");
const defect_entity_1 = require("../defect/defect.entity");
const appointment_controller_1 = require("./appointment.controller");
const appointment_entity_1 = require("./appointment.entity");
const appointment_service_1 = require("./appointment.service");
let AppointmentModule = class AppointmentModule {
};
exports.AppointmentModule = AppointmentModule;
exports.AppointmentModule = AppointmentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([appointment_entity_1.Appointment, client_entity_1.Client, car_entity_1.Car, defect_entity_1.Defect])],
        controllers: [appointment_controller_1.AppointmentController],
        providers: [appointment_service_1.AppointmentService],
    })
], AppointmentModule);
//# sourceMappingURL=appointment.module.js.map