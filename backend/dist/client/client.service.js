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
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("./client.entity");
let ClientService = class ClientService {
    clientRepository;
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    create(createClientDto) {
        const client = this.clientRepository.create({
            ...createClientDto,
            tgInviteToken: (0, crypto_1.randomUUID)(),
        });
        return this.clientRepository.save(client);
    }
    findAll() {
        return this.clientRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const client = await this.clientRepository.findOne({ where: { id } });
        if (!client) {
            throw new common_1.NotFoundException(`Client with id ${id} not found`);
        }
        return client;
    }
    async findOneByInviteToken(token) {
        return this.clientRepository.findOne({ where: { tgInviteToken: token } });
    }
    async linkTelegram(client, telegramUserId) {
        client.telegramUserId = telegramUserId;
        client.tgLinkedAt = new Date();
        return this.clientRepository.save(client);
    }
    async refreshInviteToken(id) {
        const client = await this.findOne(id);
        client.tgInviteToken = (0, crypto_1.randomUUID)();
        return this.clientRepository.save(client);
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientService);
//# sourceMappingURL=client.service.js.map