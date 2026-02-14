import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { DefectComplaint } from '../defect/defect-complaint.entity';
import { DefectStatus, DiagnosticStatus } from '../defect/defect.enums';
import { Defect } from '../defect/defect.entity';
import { UserService } from '../user/user.service';
import { TelegramSession } from './telegram-session.entity';
import { TelegramSessionState } from './telegram-session.enums';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly botToken: string;
  private readonly logger = new Logger(TelegramService.name);
  private isPolling = false;
  private pollingOffset = 0;

  constructor(
    private readonly clientService: ClientService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(TelegramSession)
    private readonly sessionRepository: Repository<TelegramSession>,
    @InjectRepository(Defect)
    private readonly defectRepository: Repository<Defect>,
    @InjectRepository(DefectComplaint)
    private readonly complaintRepository: Repository<DefectComplaint>,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
  }

  async onModuleInit(): Promise<void> {
    const mode = (this.configService.get<string>('TELEGRAM_MODE') ?? 'webhook').toLowerCase();

    if (mode !== 'polling' || !this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE') {
      return;
    }

    this.isPolling = true;
    await this.initPollingOffset();
    this.logger.log('Telegram polling started');
    void this.runPollingLoop();
  }

  onModuleDestroy(): void {
    this.isPolling = false;
  }

  async handleUpdate(update: any): Promise<void> {
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
    if (session.state === TelegramSessionState.ENTERING_DIAGNOSIS_TEXT && session.activeComplaintId) {
      await this.handleDiagnosisTextInput(chatId, mechanic.id, session, text);
      return;
    }
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    replyMarkup?: Record<string, unknown>,
  ): Promise<void> {
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

  private async initPollingOffset(): Promise<void> {
    try {
      const updates = await this.fetchUpdates(0, 1);
      if (updates.length > 0) {
        const last = updates[updates.length - 1];
        this.pollingOffset = Number(last.update_id) + 1;
      }
    } catch (error) {
      this.logger.error('Telegram polling init failed', error instanceof Error ? error.stack : String(error));
    }
  }

  private async runPollingLoop(): Promise<void> {
    const interval = Number(this.configService.get<string>('TELEGRAM_POLL_INTERVAL_MS') ?? '1500');

    while (this.isPolling) {
      try {
        const updates = await this.fetchUpdates(this.pollingOffset, 30);

        for (const update of updates) {
          await this.handleUpdate(update);
          this.pollingOffset = Number(update.update_id) + 1;
        }
      } catch (error) {
        this.logger.error('Telegram polling error', error instanceof Error ? error.stack : String(error));
      }

      if (!this.isPolling) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  private async fetchUpdates(offset: number, timeoutSec: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (offset > 0) {
      params.set('offset', String(offset));
    }
    params.set('timeout', String(timeoutSec));

    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/getUpdates?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Telegram getUpdates failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { ok: boolean; result?: any[] };
    if (!payload.ok) {
      throw new Error('Telegram getUpdates returned ok=false');
    }

    return payload.result ?? [];
  }

  private async handleClientLink(
    chatId: number | string,
    fromId: number | string,
    token: string,
  ): Promise<void> {
    const client = await this.clientService.findOneByInviteToken(token);
    if (!client) {
      await this.sendMessage(chatId, 'Ссылка недействительна. Попросите мастера прислать новую.');
      return;
    }

    await this.clientService.linkTelegram(client, String(fromId));
    await this.sendMessage(
      chatId,
      'Готово. Теперь я могу присылать вам дефектовки и документы.',
    );
  }

  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const data: string | undefined = callbackQuery?.data;
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

  private async showComplaintList(chatId: number | string, userId: string, defectId: string): Promise<void> {
    const defect = await this.defectRepository.findOne({ where: { id: defectId } });
    if (!defect) {
      await this.sendMessage(chatId, 'Дефектовка не найдена');
      return;
    }

    const complaints = await this.complaintRepository.find({
      where: { defectId, diagnosticStatus: DiagnosticStatus.NEED_REPLY },
      order: { idx: 'ASC' },
    });

    const session = await this.getOrCreateSession(userId);
    session.activeDefectId = defectId;
    session.activeComplaintId = null;
    session.state = TelegramSessionState.CHOOSING_COMPLAINT;
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

  private async showComplaintCard(chatId: number | string, userId: string, complaintId: string): Promise<void> {
    const complaint = await this.complaintRepository.findOne({ where: { id: complaintId } });
    if (!complaint) {
      await this.sendMessage(chatId, 'Жалоба не найдена');
      return;
    }

    const session = await this.getOrCreateSession(userId);
    session.activeDefectId = complaint.defectId;
    session.activeComplaintId = complaint.id;
    session.state = TelegramSessionState.CHOOSING_COMPLAINT;
    await this.sessionRepository.save(session);

    await this.sendMessage(chatId, `Жалоба №${complaint.idx}\n${complaint.complaintText}`, {
      inline_keyboard: [
        [{ text: 'Ввести ответ', callback_data: `t:${complaint.id}` }],
        [{ text: 'Назад', callback_data: `reply:${complaint.defectId}` }],
      ],
    });
  }

  private async startEnteringDiagnosis(chatId: number | string, userId: string, complaintId: string): Promise<void> {
    const complaint = await this.complaintRepository.findOne({ where: { id: complaintId } });
    if (!complaint) {
      await this.sendMessage(chatId, 'Жалоба не найдена');
      return;
    }

    const session = await this.getOrCreateSession(userId);
    session.activeDefectId = complaint.defectId;
    session.activeComplaintId = complaint.id;
    session.state = TelegramSessionState.ENTERING_DIAGNOSIS_TEXT;
    await this.sessionRepository.save(session);

    await this.sendMessage(chatId, `Введите ответ по жалобе №${complaint.idx}`);
  }

  private async handleDiagnosisTextInput(chatId: number | string, userId: string, session: TelegramSession, text: string): Promise<void> {
    const complaint = await this.complaintRepository.findOne({ where: { id: session.activeComplaintId ?? '' } });
    if (!complaint) {
      session.state = TelegramSessionState.IDLE;
      session.activeComplaintId = null;
      await this.sessionRepository.save(session);
      await this.sendMessage(chatId, 'Жалоба не найдена');
      return;
    }

    complaint.diagnosticText = text;
    complaint.diagnosticStatus = DiagnosticStatus.REPLIED;
    await this.complaintRepository.save(complaint);

    session.state = TelegramSessionState.CHOOSING_COMPLAINT;
    session.activeComplaintId = null;
    await this.sessionRepository.save(session);

    await this.sendMessage(chatId, 'Ответ сохранен.');
    await this.showComplaintList(chatId, userId, complaint.defectId);
  }

  private async finishDiagnosis(chatId: number | string, userId: string, defectId: string): Promise<void> {
    const defect = await this.defectRepository.findOne({ where: { id: defectId } });
    if (!defect) {
      await this.sendMessage(chatId, 'Дефектовка не найдена');
      return;
    }

    const pending = await this.complaintRepository.find({
      where: { defectId, diagnosticStatus: DiagnosticStatus.NEED_REPLY },
      order: { idx: 'ASC' },
    });

    if (pending.length > 0) {
      const pendingList = pending.map((c) => `- Жалоба ${c.idx}`).join('\n');
      await this.sendMessage(chatId, `Остались без ответа:\n${pendingList}`);
      await this.showComplaintList(chatId, userId, defectId);
      return;
    }

    defect.status = DefectStatus.DIAGNOSIS_DONE;
    await this.defectRepository.save(defect);

    const session = await this.getOrCreateSession(userId);
    session.state = TelegramSessionState.IDLE;
    session.activeDefectId = null;
    session.activeComplaintId = null;
    await this.sessionRepository.save(session);

    await this.sendMessage(chatId, 'Диагностика завершена');
    console.log(`[TODO] Notify reception about completed diagnosis for defect ${defect.number}`);
  }

  private async getOrCreateSession(userId: string): Promise<TelegramSession> {
    let session = await this.sessionRepository.findOne({ where: { userId } });
    if (!session) {
      session = this.sessionRepository.create({
        userId,
        activeDefectId: null,
        activeComplaintId: null,
        state: TelegramSessionState.IDLE,
      });
      session = await this.sessionRepository.save(session);
    }

    return session;
  }

  private async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    if (!callbackQueryId || !this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE') {
      return;
    }

    await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, ...(text ? { text } : {}) }),
    });
  }
}
