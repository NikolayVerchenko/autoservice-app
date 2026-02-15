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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const settings_entity_1 = require("./settings.entity");
let SettingsService = class SettingsService {
    settingsRepository;
    configService;
    singletonId = 1;
    constructor(settingsRepository, configService) {
        this.settingsRepository = settingsRepository;
        this.configService = configService;
    }
    async get() {
        let settings = await this.settingsRepository.findOne({ where: { id: this.singletonId } });
        if (!settings) {
            settings = this.settingsRepository.create({
                id: this.singletonId,
                publicBotUsername: this.configService.get('PUBLIC_BOT_USERNAME') ?? null,
                publicAppUrl: this.configService.get('PUBLIC_APP_URL') ?? null,
            });
            settings = await this.settingsRepository.save(settings);
        }
        return settings;
    }
    async update(dto) {
        const settings = await this.get();
        if (typeof dto.publicBotUsername === 'string') {
            settings.publicBotUsername = dto.publicBotUsername.trim() || null;
        }
        if (typeof dto.publicAppUrl === 'string') {
            settings.publicAppUrl = dto.publicAppUrl.trim() || null;
        }
        return this.settingsRepository.save(settings);
    }
    async getPublicBotUsername() {
        const settings = await this.get();
        return settings.publicBotUsername || this.configService.get('PUBLIC_BOT_USERNAME') || '';
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(settings_entity_1.Settings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map