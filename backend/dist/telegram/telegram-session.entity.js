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
exports.TelegramSession = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const telegram_session_enums_1 = require("./telegram-session.enums");
let TelegramSession = class TelegramSession {
    id;
    userId;
    user;
    activeDefectId;
    activeComplaintId;
    state;
    updatedAt;
};
exports.TelegramSession = TelegramSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TelegramSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: false, unique: true }),
    __metadata("design:type", String)
], TelegramSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], TelegramSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TelegramSession.prototype, "activeDefectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TelegramSession.prototype, "activeComplaintId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: telegram_session_enums_1.TelegramSessionState, default: telegram_session_enums_1.TelegramSessionState.IDLE }),
    __metadata("design:type", String)
], TelegramSession.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TelegramSession.prototype, "updatedAt", void 0);
exports.TelegramSession = TelegramSession = __decorate([
    (0, typeorm_1.Entity)('telegram_sessions')
], TelegramSession);
//# sourceMappingURL=telegram-session.entity.js.map