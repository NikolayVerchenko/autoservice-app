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
exports.DefectComplaint = void 0;
const typeorm_1 = require("typeorm");
const complaint_labor_entity_1 = require("./complaint-labor.entity");
const complaint_part_entity_1 = require("./complaint-part.entity");
const defect_entity_1 = require("./defect.entity");
const defect_enums_1 = require("./defect.enums");
let DefectComplaint = class DefectComplaint {
    id;
    defectId;
    defect;
    idx;
    complaintText;
    diagnosticText;
    diagnosticStatus;
    approvalStatus;
    labors;
    parts;
    createdAt;
    updatedAt;
};
exports.DefectComplaint = DefectComplaint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DefectComplaint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false }),
    __metadata("design:type", String)
], DefectComplaint.prototype, "defectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => defect_entity_1.Defect, (defect) => defect.complaints, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'defectId' }),
    __metadata("design:type", defect_entity_1.Defect)
], DefectComplaint.prototype, "defect", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], DefectComplaint.prototype, "idx", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], DefectComplaint.prototype, "complaintText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], DefectComplaint.prototype, "diagnosticText", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: defect_enums_1.DiagnosticStatus,
        default: defect_enums_1.DiagnosticStatus.NEED_REPLY,
    }),
    __metadata("design:type", String)
], DefectComplaint.prototype, "diagnosticStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: defect_enums_1.ApprovalStatus,
        default: defect_enums_1.ApprovalStatus.PENDING,
    }),
    __metadata("design:type", String)
], DefectComplaint.prototype, "approvalStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_labor_entity_1.ComplaintLabor, (labor) => labor.complaint, {
        cascade: ['insert', 'update'],
    }),
    __metadata("design:type", Array)
], DefectComplaint.prototype, "labors", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_part_entity_1.ComplaintPart, (part) => part.complaint, {
        cascade: ['insert', 'update'],
    }),
    __metadata("design:type", Array)
], DefectComplaint.prototype, "parts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DefectComplaint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DefectComplaint.prototype, "updatedAt", void 0);
exports.DefectComplaint = DefectComplaint = __decorate([
    (0, typeorm_1.Entity)('defect_complaints')
], DefectComplaint);
//# sourceMappingURL=defect-complaint.entity.js.map