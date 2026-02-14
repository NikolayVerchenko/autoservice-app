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
exports.DefectService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const telegram_service_1 = require("../telegram/telegram.service");
const car_entity_1 = require("../car/car.entity");
const client_entity_1 = require("../client/client.entity");
const user_entity_1 = require("../user/user.entity");
const user_enums_1 = require("../user/user.enums");
const complaint_labor_entity_1 = require("./complaint-labor.entity");
const complaint_part_entity_1 = require("./complaint-part.entity");
const defect_complaint_entity_1 = require("./defect-complaint.entity");
const defect_enums_1 = require("./defect.enums");
const defect_entity_1 = require("./defect.entity");
let DefectService = class DefectService {
    dataSource;
    configService;
    telegramService;
    defectRepository;
    complaintRepository;
    complaintLaborRepository;
    complaintPartRepository;
    clientRepository;
    carRepository;
    userRepository;
    botToken;
    constructor(dataSource, configService, telegramService, defectRepository, complaintRepository, complaintLaborRepository, complaintPartRepository, clientRepository, carRepository, userRepository) {
        this.dataSource = dataSource;
        this.configService = configService;
        this.telegramService = telegramService;
        this.defectRepository = defectRepository;
        this.complaintRepository = complaintRepository;
        this.complaintLaborRepository = complaintLaborRepository;
        this.complaintPartRepository = complaintPartRepository;
        this.clientRepository = clientRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN') ?? '';
    }
    async create(dto) {
        const client = await this.clientRepository.findOne({ where: { id: dto.clientId } });
        if (!client)
            throw new common_1.NotFoundException(`Client with id ${dto.clientId} not found`);
        const car = await this.carRepository.findOne({ where: { id: dto.carId } });
        if (!car)
            throw new common_1.NotFoundException(`Car with id ${dto.carId} not found`);
        if (car.clientId !== dto.clientId)
            throw new common_1.NotFoundException('Car does not belong to provided client');
        const createdId = await this.dataSource.transaction(async (manager) => {
            const year = new Date().getFullYear();
            const rows = await manager.query(`INSERT INTO counters("key", "year", "lastValue") VALUES ($1, $2, 1)
         ON CONFLICT ("key", "year") DO UPDATE SET "lastValue" = counters."lastValue" + 1
         RETURNING "lastValue"`, ['defect_number', year]);
            const number = this.formatDefectNumber(year, Number(rows[0].lastValue));
            const complaints = dto.complaints.map((item, index) => manager.create(defect_complaint_entity_1.DefectComplaint, {
                idx: index + 1,
                complaintText: item.complaintText,
                diagnosticText: null,
                diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY,
                approvalStatus: defect_enums_1.ApprovalStatus.PENDING,
            }));
            const defect = manager.create(defect_entity_1.Defect, {
                number,
                clientId: dto.clientId,
                carId: dto.carId,
                status: defect_enums_1.DefectStatus.DRAFT,
                complaints,
            });
            const saved = await manager.save(defect_entity_1.Defect, defect);
            return saved.id;
        });
        return this.findOne(createdId);
    }
    async findAll(query) {
        return this.defectRepository.find({
            where: {
                ...(query.status ? { status: query.status } : {}),
                ...(query.clientId ? { clientId: query.clientId } : {}),
                ...(query.carId ? { carId: query.carId } : {}),
            },
            relations: { complaints: true, client: true, car: true },
            order: { createdAt: 'DESC', complaints: { idx: 'ASC' } },
        });
    }
    async findOne(id) {
        const defect = await this.defectRepository.findOne({
            where: { id },
            relations: { complaints: { labors: true, parts: true }, client: true, car: true },
            order: { complaints: { idx: 'ASC' } },
        });
        if (!defect)
            throw new common_1.NotFoundException(`Defect with id ${id} not found`);
        return this.attachTotals(defect);
    }
    async sendDefectToClient(defectId) {
        const defect = await this.findOne(defectId);
        if (!defect.client?.telegramUserId) {
            throw new common_1.BadRequestException('Client is not linked to Telegram');
        }
        if (!defect.publicShareToken) {
            defect.publicShareToken = (0, crypto_1.randomUUID)();
            await this.defectRepository.update({ id: defectId }, { publicShareToken: defect.publicShareToken });
        }
        const publicUrl = this.configService.get('PUBLIC_APP_URL') ?? 'http://localhost:3000';
        const carLine = `${defect.car?.brand ?? ''} ${defect.car?.model ?? ''}${defect.car?.plate ? ` ${defect.car.plate}` : ''}`.trim();
        const text = [
            `Дефектовка ${defect.number}`,
            `Авто: ${carLine}`,
            `Жалобы: ${defect.complaints?.length ?? 0}`,
            `Итого: ${defect.totals?.totalRub ?? 0} руб.`,
            '',
            `Открой: ${publicUrl}/defects/${defect.id}?token=${defect.publicShareToken}`,
            'PDF: (пока пропустить, позже добавим)',
        ].join('\n');
        await this.telegramService.sendMessage(defect.client.telegramUserId, text);
        return { ok: true };
    }
    async addComplaint(defectId, dto) {
        await this.findOne(defectId);
        const maxIdxRaw = await this.complaintRepository
            .createQueryBuilder('complaint')
            .select('COALESCE(MAX(complaint.idx), 0)', 'max')
            .where('complaint.defectId = :defectId', { defectId })
            .getRawOne();
        const complaint = this.complaintRepository.create({
            defectId,
            idx: Number(maxIdxRaw?.max ?? 0) + 1,
            complaintText: dto.complaintText,
            diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY,
            approvalStatus: defect_enums_1.ApprovalStatus.PENDING,
        });
        return this.complaintRepository.save(complaint);
    }
    async updateComplaint(id, dto) {
        const complaint = await this.getComplaintOrThrow(id);
        Object.assign(complaint, dto);
        return this.complaintRepository.save(complaint);
    }
    async updateComplaintApproval(id, dto) {
        const complaint = await this.getComplaintOrThrow(id);
        complaint.approvalStatus = dto.approvalStatus;
        return this.complaintRepository.save(complaint);
    }
    async addLabor(complaintId, dto) {
        await this.getComplaintOrThrow(complaintId);
        const labor = this.complaintLaborRepository.create({ complaintId, ...dto });
        return this.complaintLaborRepository.save(labor);
    }
    async updateLabor(id, dto) {
        const labor = await this.complaintLaborRepository.findOne({ where: { id } });
        if (!labor)
            throw new common_1.NotFoundException(`Complaint labor with id ${id} not found`);
        Object.assign(labor, dto);
        return this.complaintLaborRepository.save(labor);
    }
    async deleteLabor(id) {
        const result = await this.complaintLaborRepository.delete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException(`Complaint labor with id ${id} not found`);
        return { deleted: true };
    }
    async addPart(complaintId, dto) {
        await this.getComplaintOrThrow(complaintId);
        const part = this.complaintPartRepository.create({ complaintId, ...dto });
        return this.complaintPartRepository.save(part);
    }
    async updatePart(id, dto) {
        const part = await this.complaintPartRepository.findOne({ where: { id } });
        if (!part)
            throw new common_1.NotFoundException(`Complaint part with id ${id} not found`);
        Object.assign(part, dto);
        return this.complaintPartRepository.save(part);
    }
    async deletePart(id) {
        const result = await this.complaintPartRepository.delete({ id });
        if (!result.affected)
            throw new common_1.NotFoundException(`Complaint part with id ${id} not found`);
        return { deleted: true };
    }
    async assignMechanic(defectId, dto) {
        const defect = await this.defectRepository.findOne({
            where: { id: defectId },
            relations: { complaints: true, client: true, car: true },
            order: { complaints: { idx: 'ASC' } },
        });
        if (!defect)
            throw new common_1.NotFoundException(`Defect with id ${defectId} not found`);
        const mechanic = await this.userRepository.findOne({ where: { id: dto.mechanicId } });
        if (!mechanic || mechanic.role !== user_enums_1.UserRole.MECHANIC) {
            throw new common_1.NotFoundException(`Mechanic with id ${dto.mechanicId} not found`);
        }
        defect.assignedMechanicId = dto.mechanicId;
        defect.status = defect_enums_1.DefectStatus.ASSIGNED;
        await this.defectRepository.save(defect);
        await this.complaintRepository.update({ defectId, diagnosticStatus: defect_enums_1.DiagnosticStatus.REPLIED, diagnosticText: (0, typeorm_2.IsNull)() }, { diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY });
        await this.complaintRepository.update({ defectId, diagnosticStatus: defect_enums_1.DiagnosticStatus.REPLIED, diagnosticText: '' }, { diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY });
        const refreshed = await this.findOne(defectId);
        await this.notifyMechanic(mechanic, refreshed);
        return refreshed;
    }
    async getComplaintOrThrow(id) {
        const complaint = await this.complaintRepository.findOne({ where: { id } });
        if (!complaint)
            throw new common_1.NotFoundException(`Complaint with id ${id} not found`);
        return complaint;
    }
    attachTotals(defect) {
        const complaints = (defect.complaints ?? []).map((complaint) => {
            const laborTotalRub = (complaint.labors ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);
            const partsTotalRub = (complaint.parts ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);
            return { ...complaint, laborTotalRub, partsTotalRub, totalRub: laborTotalRub + partsTotalRub };
        });
        const laborTotalRub = complaints.reduce((sum, c) => sum + c.laborTotalRub, 0);
        const partsTotalRub = complaints.reduce((sum, c) => sum + c.partsTotalRub, 0);
        return { ...defect, complaints, totals: { laborTotalRub, partsTotalRub, totalRub: laborTotalRub + partsTotalRub } };
    }
    formatDefectNumber(year, value) {
        return `ДФ-${year}-${String(value).padStart(6, '0')}`;
    }
    async notifyMechanic(mechanic, defect) {
        if (!mechanic.telegramUserId)
            return;
        const complaintsText = (defect.complaints ?? []).map((c) => `${c.idx}. ${c.complaintText}`).join('\n');
        const text = [
            `Вам назначена дефектовка ${defect.number}`,
            `Клиент: ${defect.client.name}`,
            `Авто: ${defect.car.brand} ${defect.car.model}`,
            'Жалобы:',
            complaintsText || 'Нет жалоб',
            "Нажмите 'Ответить на жалобы'",
        ].join('\n');
        await this.sendTelegramMessage(mechanic.telegramUserId, text, {
            inline_keyboard: [[{ text: 'Ответить на жалобы', callback_data: `reply:${defect.id}` }]],
        });
    }
    async sendTelegramMessage(chatId, text, replyMarkup) {
        if (!this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE')
            return;
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }),
        });
        if (!response.ok) {
            throw new Error(`Telegram API sendMessage failed with status ${response.status}`);
        }
    }
};
exports.DefectService = DefectService;
exports.DefectService = DefectService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(defect_entity_1.Defect)),
    __param(4, (0, typeorm_1.InjectRepository)(defect_complaint_entity_1.DefectComplaint)),
    __param(5, (0, typeorm_1.InjectRepository)(complaint_labor_entity_1.ComplaintLabor)),
    __param(6, (0, typeorm_1.InjectRepository)(complaint_part_entity_1.ComplaintPart)),
    __param(7, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(8, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(9, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        config_1.ConfigService,
        telegram_service_1.TelegramService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DefectService);
//# sourceMappingURL=defect.service.js.map