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
exports.ComplaintPartController = exports.ComplaintLaborController = exports.ComplaintController = exports.PublicDefectController = exports.DefectController = void 0;
const common_1 = require("@nestjs/common");
const defect_service_1 = require("./defect.service");
const add_complaint_dto_1 = require("./dto/add-complaint.dto");
const assign_mechanic_dto_1 = require("./dto/assign-mechanic.dto");
const create_complaint_labor_dto_1 = require("./dto/create-complaint-labor.dto");
const create_complaint_part_dto_1 = require("./dto/create-complaint-part.dto");
const create_defect_dto_1 = require("./dto/create-defect.dto");
const find_defects_query_dto_1 = require("./dto/find-defects-query.dto");
const update_complaint_approval_dto_1 = require("./dto/update-complaint-approval.dto");
const update_complaint_labor_dto_1 = require("./dto/update-complaint-labor.dto");
const update_complaint_part_dto_1 = require("./dto/update-complaint-part.dto");
const update_complaint_dto_1 = require("./dto/update-complaint.dto");
let DefectController = class DefectController {
    defectService;
    constructor(defectService) {
        this.defectService = defectService;
    }
    create(dto) {
        return this.defectService.create(dto);
    }
    findAll(query) {
        return this.defectService.findAll(query);
    }
    findOne(id) {
        return this.defectService.findOne(id);
    }
    addComplaint(id, dto) {
        return this.defectService.addComplaint(id, dto);
    }
    assignMechanic(id, dto) {
        return this.defectService.assignMechanic(id, dto);
    }
    sendToClient(id) {
        return this.defectService.sendDefectToClient(id);
    }
};
exports.DefectController = DefectController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_defect_dto_1.CreateDefectDto]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_defects_query_dto_1.FindDefectsQueryDto]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/complaints'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_complaint_dto_1.AddComplaintDto]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "addComplaint", null);
__decorate([
    (0, common_1.Post)(':id/assign-mechanic'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_mechanic_dto_1.AssignMechanicDto]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "assignMechanic", null);
__decorate([
    (0, common_1.Post)(':id/send-to-client'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DefectController.prototype, "sendToClient", null);
exports.DefectController = DefectController = __decorate([
    (0, common_1.Controller)('defects'),
    __metadata("design:paramtypes", [defect_service_1.DefectService])
], DefectController);
let PublicDefectController = class PublicDefectController {
    defectService;
    constructor(defectService) {
        this.defectService = defectService;
    }
    getPublicHtml(id, token) {
        return this.defectService.getPublicDefectHtml(id, token);
    }
};
exports.PublicDefectController = PublicDefectController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicDefectController.prototype, "getPublicHtml", null);
exports.PublicDefectController = PublicDefectController = __decorate([
    (0, common_1.Controller)('public/defects'),
    __metadata("design:paramtypes", [defect_service_1.DefectService])
], PublicDefectController);
let ComplaintController = class ComplaintController {
    defectService;
    constructor(defectService) {
        this.defectService = defectService;
    }
    update(id, dto) {
        return this.defectService.updateComplaint(id, dto);
    }
    updateApproval(id, dto) {
        return this.defectService.updateComplaintApproval(id, dto);
    }
    addLabor(id, dto) {
        return this.defectService.addLabor(id, dto);
    }
    addPart(id, dto) {
        return this.defectService.addPart(id, dto);
    }
};
exports.ComplaintController = ComplaintController;
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_complaint_dto_1.UpdateComplaintDto]),
    __metadata("design:returntype", Promise)
], ComplaintController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approval'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_complaint_approval_dto_1.UpdateComplaintApprovalDto]),
    __metadata("design:returntype", Promise)
], ComplaintController.prototype, "updateApproval", null);
__decorate([
    (0, common_1.Post)(':id/labors'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_complaint_labor_dto_1.CreateComplaintLaborDto]),
    __metadata("design:returntype", Promise)
], ComplaintController.prototype, "addLabor", null);
__decorate([
    (0, common_1.Post)(':id/parts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_complaint_part_dto_1.CreateComplaintPartDto]),
    __metadata("design:returntype", Promise)
], ComplaintController.prototype, "addPart", null);
exports.ComplaintController = ComplaintController = __decorate([
    (0, common_1.Controller)('complaints'),
    __metadata("design:paramtypes", [defect_service_1.DefectService])
], ComplaintController);
let ComplaintLaborController = class ComplaintLaborController {
    defectService;
    constructor(defectService) {
        this.defectService = defectService;
    }
    update(id, dto) {
        return this.defectService.updateLabor(id, dto);
    }
    remove(id) {
        return this.defectService.deleteLabor(id);
    }
};
exports.ComplaintLaborController = ComplaintLaborController;
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_complaint_labor_dto_1.UpdateComplaintLaborDto]),
    __metadata("design:returntype", Promise)
], ComplaintLaborController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplaintLaborController.prototype, "remove", null);
exports.ComplaintLaborController = ComplaintLaborController = __decorate([
    (0, common_1.Controller)('complaint-labors'),
    __metadata("design:paramtypes", [defect_service_1.DefectService])
], ComplaintLaborController);
let ComplaintPartController = class ComplaintPartController {
    defectService;
    constructor(defectService) {
        this.defectService = defectService;
    }
    update(id, dto) {
        return this.defectService.updatePart(id, dto);
    }
    remove(id) {
        return this.defectService.deletePart(id);
    }
};
exports.ComplaintPartController = ComplaintPartController;
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_complaint_part_dto_1.UpdateComplaintPartDto]),
    __metadata("design:returntype", Promise)
], ComplaintPartController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplaintPartController.prototype, "remove", null);
exports.ComplaintPartController = ComplaintPartController = __decorate([
    (0, common_1.Controller)('complaint-parts'),
    __metadata("design:paramtypes", [defect_service_1.DefectService])
], ComplaintPartController);
//# sourceMappingURL=defect.controller.js.map