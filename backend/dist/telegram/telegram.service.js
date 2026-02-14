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
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_service_1 = require("../client/client.service");
const defect_complaint_entity_1 = require("../defect/defect-complaint.entity");
const defect_enums_1 = require("../defect/defect.enums");
const defect_entity_1 = require("../defect/defect.entity");
const user_service_1 = require("../user/user.service");
const telegram_session_entity_1 = require("./telegram-session.entity");
const telegram_session_enums_1 = require("./telegram-session.enums");
let TelegramService = class TelegramService {
    clientService;
    userService;
    configService;
    sessionRepository;
    defectRepository;
    complaintRepository;
    botToken;
    constructor(clientService, userService, configService, sessionRepository, defectRepository, complaintRepository) {
        this.clientService = clientService;
        this.userService = userService;
        this.configService = configService;
        this.sessionRepository = sessionRepository;
        this.defectRepository = defectRepository;
        this.complaintRepository = complaintRepository;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN') ?? '';
    }
    async handleUpdate(update) {
        if (update?.callback_query) {
            await this.handleCallbackQuery(update.callback_query);
            return;
        }
        const message = update?.message;
        const text = message?.text;
        if (typeof text !== 'string') {
            return;
        }
        const chatId = message?.chat?.id;
        const fromId = message?.from?.id;
        if (!chatId || !fromId) {
            return;
        }
        const linkMatch = text.match(/^\/start\s+link_(\S+)$/);
        if (linkMatch) {
            await this.handleClientLink(chatId, fromId, linkMatch[1]);
            return;
        }
        const mechanic = await this.userService.findMechanicByTelegramUserId(String(fromId));
        if (!mechanic) {
            await this.sendMessage(chatId, 'Вы не зарегистрированы как механик');
            return;
        }
        const session = await this.getOrCreateSession(mechanic.id);
        if (session.state === telegram_session_enums_1.TelegramSessionState.ENTERING_DIAGNOSIS_TEXT && session.activeComplaintId) {
            await this.handleDiagnosisTextInput(chatId, mechanic.id, session, text);
            return;
        }
    }
    async sendMessage(chatId, text, replyMarkup) {
        if (!this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE') {
            return;
        }
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
            }),
        });
        if (!response.ok) {
            throw new Error(`Telegram API sendMessage failed with status ${response.status}`);
        }
    }
    async handleClientLink(chatId, fromId, token) {
        const client = await this.clientService.findOneByInviteToken(token);
        if (!client) {
            await this.sendMessage(chatId, 'Ссылка недействительна. Попросите мастера прислать новую.');
            return;
        }
        await this.clientService.linkTelegram(client, String(fromId));
        await this.sendMessage(chatId, 'Готово. Теперь я могу присылать вам дефектовки и документы.');
    }
    async handleCallbackQuery(callbackQuery) {
        const data = callbackQuery?.data;
        const fromId = callbackQuery?.from?.id;
        const chatId = callbackQuery?.message?.chat?.id;
        const callbackId = callbackQuery?.id;
        if (!data || !fromId || !chatId) {
            return;
        }
        const mechanic = await this.userService.findMechanicByTelegramUserId(String(fromId));
        if (!mechanic) {
            await this.answerCallbackQuery(callbackId, 'Вы не зарегистрированы как механик');
            await this.sendMessage(chatId, 'Вы не зарегистрированы как механик');
            return;
        }
        await this.answerCallbackQuery(callbackId);
        if (data.startsWith('reply:')) {
            const defectId = data.slice('reply:'.length);
            await this.showComplaintList(chatId, mechanic.id, defectId);
            return;
        }
        if (data.startsWith('c:')) {
            const complaintId = data.slice('c:'.length);
            await this.showComplaintCard(chatId, mechanic.id, complaintId);
            return;
        }
        if (data.startsWith('t:')) {
            const complaintId = data.slice('t:'.length);
            await this.startEnteringDiagnosis(chatId, mechanic.id, complaintId);
            return;
        }
        if (data.startsWith('done:')) {
            const defectId = data.slice('done:'.length);
            await this.finishDiagnosis(chatId, mechanic.id, defectId);
        }
    }
    async showComplaintList(chatId, userId, defectId) {
        const defect = await this.defectRepository.findOne({ where: { id: defectId } });
        if (!defect) {
            await this.sendMessage(chatId, 'Дефектовка не найдена');
            return;
        }
        const complaints = await this.complaintRepository.find({
            where: { defectId, diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY },
            order: { idx: 'ASC' },
        });
        const session = await this.getOrCreateSession(userId);
        session.activeDefectId = defectId;
        session.activeComplaintId = null;
        session.state = telegram_session_enums_1.TelegramSessionState.CHOOSING_COMPLAINT;
        await this.sessionRepository.save(session);
        if (complaints.length === 0) {
            await this.sendMessage(chatId, 'Все жалобы обработаны.', {
                inline_keyboard: [[{ text: 'Завершить диагностику', callback_data: `done:${defectId}` }]],
            });
            return;
        }
        const keyboard = complaints.map((c) => [{ text: `Жалоба ${c.idx}`, callback_data: `c:${c.id}` }]);
        keyboard.push([{ text: 'Завершить диагностику', callback_data: `done:${defectId}` }]);
        await this.sendMessage(chatId, `Выберите жалобу для ответа (${defect.number})`, {
            inline_keyboard: keyboard,
        });
    }
    async showComplaintCard(chatId, userId, complaintId) {
        const complaint = await this.complaintRepository.findOne({ where: { id: complaintId } });
        if (!complaint) {
            await this.sendMessage(chatId, 'Жалоба не найдена');
            return;
        }
        const session = await this.getOrCreateSession(userId);
        session.activeDefectId = complaint.defectId;
        session.activeComplaintId = complaint.id;
        session.state = telegram_session_enums_1.TelegramSessionState.CHOOSING_COMPLAINT;
        await this.sessionRepository.save(session);
        await this.sendMessage(chatId, `Жалоба №${complaint.idx}\n${complaint.complaintText}`, {
            inline_keyboard: [
                [{ text: 'Ввести ответ', callback_data: `t:${complaint.id}` }],
                [{ text: 'Назад', callback_data: `reply:${complaint.defectId}` }],
            ],
        });
    }
    async startEnteringDiagnosis(chatId, userId, complaintId) {
        const complaint = await this.complaintRepository.findOne({ where: { id: complaintId } });
        if (!complaint) {
            await this.sendMessage(chatId, 'Жалоба не найдена');
            return;
        }
        const session = await this.getOrCreateSession(userId);
        session.activeDefectId = complaint.defectId;
        session.activeComplaintId = complaint.id;
        session.state = telegram_session_enums_1.TelegramSessionState.ENTERING_DIAGNOSIS_TEXT;
        await this.sessionRepository.save(session);
        await this.sendMessage(chatId, `Введите ответ по жалобе №${complaint.idx}`);
    }
    async handleDiagnosisTextInput(chatId, userId, session, text) {
        const complaint = await this.complaintRepository.findOne({ where: { id: session.activeComplaintId ?? '' } });
        if (!complaint) {
            session.state = telegram_session_enums_1.TelegramSessionState.IDLE;
            session.activeComplaintId = null;
            await this.sessionRepository.save(session);
            await this.sendMessage(chatId, 'Жалоба не найдена');
            return;
        }
        complaint.diagnosticText = text;
        complaint.diagnosticStatus = defect_enums_1.DiagnosticStatus.REPLIED;
        await this.complaintRepository.save(complaint);
        session.state = telegram_session_enums_1.TelegramSessionState.CHOOSING_COMPLAINT;
        session.activeComplaintId = null;
        await this.sessionRepository.save(session);
        await this.sendMessage(chatId, 'Ответ сохранен.');
        await this.showComplaintList(chatId, userId, complaint.defectId);
    }
    async finishDiagnosis(chatId, userId, defectId) {
        const defect = await this.defectRepository.findOne({ where: { id: defectId } });
        if (!defect) {
            await this.sendMessage(chatId, 'Дефектовка не найдена');
            return;
        }
        const pending = await this.complaintRepository.find({
            where: { defectId, diagnosticStatus: defect_enums_1.DiagnosticStatus.NEED_REPLY },
            order: { idx: 'ASC' },
        });
        if (pending.length > 0) {
            const pendingList = pending.map((c) => `- Жалоба ${c.idx}`).join('\n');
            await this.sendMessage(chatId, `Остались без ответа:\n${pendingList}`);
            await this.showComplaintList(chatId, userId, defectId);
            return;
        }
        defect.status = defect_enums_1.DefectStatus.DIAGNOSIS_DONE;
        await this.defectRepository.save(defect);
        const session = await this.getOrCreateSession(userId);
        session.state = telegram_session_enums_1.TelegramSessionState.IDLE;
        session.activeDefectId = null;
        session.activeComplaintId = null;
        await this.sessionRepository.save(session);
        await this.sendMessage(chatId, 'Диагностика завершена');
        console.log(`[TODO] Notify reception about completed diagnosis for defect ${defect.number}`);
    }
    async getOrCreateSession(userId) {
        let session = await this.sessionRepository.findOne({ where: { userId } });
        if (!session) {
            session = this.sessionRepository.create({
                userId,
                activeDefectId: null,
                activeComplaintId: null,
                state: telegram_session_enums_1.TelegramSessionState.IDLE,
            });
            session = await this.sessionRepository.save(session);
        }
        return session;
    }
    async answerCallbackQuery(callbackQueryId, text) {
        if (!callbackQueryId || !this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE') {
            return;
        }
        await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackQueryId, ...(text ? { text } : {}) }),
        });
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(telegram_session_entity_1.TelegramSession)),
    __param(4, (0, typeorm_1.InjectRepository)(defect_entity_1.Defect)),
    __param(5, (0, typeorm_1.InjectRepository)(defect_complaint_entity_1.DefectComplaint)),
    __metadata("design:paramtypes", [client_service_1.ClientService,
        user_service_1.UserService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map