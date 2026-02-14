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
exports.ComplaintLabor = void 0;
const typeorm_1 = require("typeorm");
const defect_complaint_entity_1 = require("./defect-complaint.entity");
let ComplaintLabor = class ComplaintLabor {
    id;
    complaintId;
    complaint;
    name;
    qty;
    priceRub;
    createdAt;
    updatedAt;
};
exports.ComplaintLabor = ComplaintLabor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ComplaintLabor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], ComplaintLabor.prototype, "complaintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => defect_complaint_entity_1.DefectComplaint, (complaint) => complaint.labors, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'complaintId' }),
    __metadata("design:type", defect_complaint_entity_1.DefectComplaint)
], ComplaintLabor.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], ComplaintLabor.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComplaintLabor.prototype, "qty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ComplaintLabor.prototype, "priceRub", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ComplaintLabor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ComplaintLabor.prototype, "updatedAt", void 0);
exports.ComplaintLabor = ComplaintLabor = __decorate([
    (0, typeorm_1.Entity)('complaint_labors')
], ComplaintLabor);
//# sourceMappingURL=complaint-labor.entity.js.map