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
exports.ClientController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const client_service_1 = require("./client.service");
let ClientController = class ClientController {
    clientService;
    configService;
    constructor(clientService, configService) {
        this.clientService = clientService;
        this.configService = configService;
    }
    create(createClientDto) {
        return this.clientService.create(createClientDto);
    }
    findAll() {
        return this.clientService.findAll();
    }
    findOne(id) {
        return this.clientService.findOne(id);
    }
    update(id, updateClientDto) {
        return this.clientService.update(id, updateClientDto);
    }
    remove(id) {
        return this.clientService.remove(id);
    }
    async refreshTelegramToken(id) {
        const client = await this.clientService.refreshInviteToken(id);
        return {
            tgInviteToken: client.tgInviteToken,
            tgLink: this.buildTelegramLink(client.tgInviteToken),
        };
    }
    async getTelegramLink(id) {
        const client = await this.clientService.findOne(id);
        return {
            tgInviteToken: client.tgInviteToken,
            tgLink: this.buildTelegramLink(client.tgInviteToken),
        };
    }
    buildTelegramLink(token) {
        const username = this.configService.get('PUBLIC_BOT_USERNAME') ?? '';
        const safeToken = token ?? '';
        return `https://t.me/${username}?start=link_${safeToken}`;
    }
};
exports.ClientController = ClientController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/tg-refresh-token'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "refreshTelegramToken", null);
__decorate([
    (0, common_1.Get)(':id/tg-link'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "getTelegramLink", null);
exports.ClientController = ClientController = __decorate([
    (0, common_1.Controller)('clients'),
    __metadata("design:paramtypes", [client_service_1.ClientService,
        config_1.ConfigService])
], ClientController);
//# sourceMappingURL=client.controller.js.map