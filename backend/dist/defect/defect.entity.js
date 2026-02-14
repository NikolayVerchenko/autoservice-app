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
exports.Defect = void 0;
const typeorm_1 = require("typeorm");
const car_entity_1 = require("../car/car.entity");
const client_entity_1 = require("../client/client.entity");
const defect_enums_1 = require("./defect.enums");
const defect_complaint_entity_1 = require("./defect-complaint.entity");
let Defect = class Defect {
    id;
    number;
    clientId;
    client;
    carId;
    car;
    createdByUserId;
    assignedMechanicId;
    status;
    plannedVisitDate;
    publicShareToken;
    complaints;
    createdAt;
    updatedAt;
};
exports.Defect = Defect;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Defect.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Defect.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], Defect.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client, (client) => client.defects, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", client_entity_1.Client)
], Defect.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], Defect.prototype, "carId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => car_entity_1.Car, (car) => car.defects, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'carId' }),
    __metadata("design:type", car_entity_1.Car)
], Defect.prototype, "car", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Defect.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Defect.prototype, "assignedMechanicId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: defect_enums_1.DefectStatus,
        default: defect_enums_1.DefectStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Defect.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Defect.prototype, "plannedVisitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Defect.prototype, "publicShareToken", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => defect_complaint_entity_1.DefectComplaint, (complaint) => complaint.defect, {
        cascade: ['insert', 'update'],
    }),
    __metadata("design:type", Array)
], Defect.prototype, "complaints", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Defect.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Defect.prototype, "updatedAt", void 0);
exports.Defect = Defect = __decorate([
    (0, typeorm_1.Entity)('defects')
], Defect);
//# sourceMappingURL=defect.entity.js.map