"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatus = exports.DiagnosticStatus = exports.DefectStatus = void 0;
var DefectStatus;
(function (DefectStatus) {
    DefectStatus["DRAFT"] = "DRAFT";
    DefectStatus["ASSIGNED"] = "ASSIGNED";
    DefectStatus["DIAGNOSIS"] = "DIAGNOSIS";
    DefectStatus["DIAGNOSIS_DONE"] = "DIAGNOSIS_DONE";
    DefectStatus["ESTIMATE"] = "ESTIMATE";
    DefectStatus["APPROVAL"] = "APPROVAL";
    DefectStatus["APPROVED"] = "APPROVED";
    DefectStatus["ORDER_CREATED"] = "ORDER_CREATED";
    DefectStatus["CANCELED"] = "CANCELED";
})(DefectStatus || (exports.DefectStatus = DefectStatus = {}));
var DiagnosticStatus;
(function (DiagnosticStatus) {
    DiagnosticStatus["NEED_REPLY"] = "NEED_REPLY";
    DiagnosticStatus["REPLIED"] = "REPLIED";
})(DiagnosticStatus || (exports.DiagnosticStatus = DiagnosticStatus = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["ORDER"] = "ORDER";
    ApprovalStatus["RECOMMENDATION"] = "RECOMMENDATION";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
//# sourceMappingURL=defect.enums.js.map