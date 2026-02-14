import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TelegramService } from '../telegram/telegram.service';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user.enums';
import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { AddComplaintDto } from './dto/add-complaint.dto';
import { AssignMechanicDto } from './dto/assign-mechanic.dto';
import { CreateComplaintLaborDto } from './dto/create-complaint-labor.dto';
import { CreateComplaintPartDto } from './dto/create-complaint-part.dto';
import { CreateDefectDto } from './dto/create-defect.dto';
import { FindDefectsQueryDto } from './dto/find-defects-query.dto';
import { UpdateComplaintApprovalDto } from './dto/update-complaint-approval.dto';
import { UpdateComplaintLaborDto } from './dto/update-complaint-labor.dto';
import { UpdateComplaintPartDto } from './dto/update-complaint-part.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { DefectComplaint } from './defect-complaint.entity';
import { ApprovalStatus, DefectStatus, DiagnosticStatus } from './defect.enums';
import { Defect } from './defect.entity';

@Injectable()
export class DefectService {
  private readonly botToken: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
    @InjectRepository(Defect)
    private readonly defectRepository: Repository<Defect>,
    @InjectRepository(DefectComplaint)
    private readonly complaintRepository: Repository<DefectComplaint>,
    @InjectRepository(ComplaintLabor)
    private readonly complaintLaborRepository: Repository<ComplaintLabor>,
    @InjectRepository(ComplaintPart)
    private readonly complaintPartRepository: Repository<ComplaintPart>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
  }

  async create(dto: CreateDefectDto): Promise<any> {
    const client = await this.clientRepository.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException(`Client with id ${dto.clientId} not found`);

    const car = await this.carRepository.findOne({ where: { id: dto.carId } });
    if (!car) throw new NotFoundException(`Car with id ${dto.carId} not found`);
    if (car.clientId !== dto.clientId) throw new NotFoundException('Car does not belong to provided client');

    const createdId = await this.dataSource.transaction(async (manager) => {
      const year = new Date().getFullYear();
      const rows = await manager.query(
        `INSERT INTO counters("key", "year", "lastValue") VALUES ($1, $2, 1)
         ON CONFLICT ("key", "year") DO UPDATE SET "lastValue" = counters."lastValue" + 1
         RETURNING "lastValue"`,
        ['defect_number', year],
      );
      const number = this.formatDefectNumber(year, Number(rows[0].lastValue));

      const complaints = dto.complaints.map((item, index) =>
        manager.create(DefectComplaint, {
          idx: index + 1,
          complaintText: item.complaintText,
          diagnosticText: null,
          diagnosticStatus: DiagnosticStatus.NEED_REPLY,
          approvalStatus: ApprovalStatus.PENDING,
        }),
      );

      const defect = manager.create(Defect, {
        number,
        clientId: dto.clientId,
        carId: dto.carId,
        status: DefectStatus.DRAFT,
        complaints,
      });
      const saved = await manager.save(Defect, defect);
      return saved.id;
    });

    return this.findOne(createdId);
  }

  async findAll(query: FindDefectsQueryDto): Promise<any[]> {
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

  async findOne(id: string): Promise<any> {
    const defect = await this.getDefectWithDetailsOrThrow(id);
    return this.attachTotals(defect);
  }

  async getPublicDefectHtml(defectId: string, token?: string): Promise<string> {
    const defect = await this.getDefectWithDetailsOrThrow(defectId);

    if (!defect.publicShareToken) {
      throw new NotFoundException();
    }

    if (!token || token !== defect.publicShareToken) {
      throw new ForbiddenException();
    }

    const view = this.attachTotals(defect);
    return this.renderPublicDefectHtml(view);
  }

  async sendDefectToClient(defectId: string): Promise<{ ok: true }> {
    const defect = await this.findOne(defectId);
    if (!defect.client?.telegramUserId) {
      throw new BadRequestException('Client is not linked to Telegram');
    }

    if (!defect.publicShareToken) {
      defect.publicShareToken = randomUUID();
      await this.defectRepository.update({ id: defectId }, { publicShareToken: defect.publicShareToken });
    }

    const publicUrl = this.configService.get<string>('PUBLIC_APP_URL') ?? 'http://localhost:3000';
    const carLine = `${defect.car?.brand ?? ''} ${defect.car?.model ?? ''}${defect.car?.plate ? ` ${defect.car.plate}` : ''}`.trim();

    const text = [
      `Дефектовка ${defect.number}`,
      `Авто: ${carLine}`,
      `Жалобы: ${defect.complaints?.length ?? 0}`,
      `Итого: ${defect.totals?.totalRub ?? 0} руб.`,
      '',
      `Открой: ${publicUrl}/public/defects/${defect.id}?token=${defect.publicShareToken}`,
      'PDF: (пока пропустить, позже добавим)',
    ].join('\n');

    await this.telegramService.sendMessage(defect.client.telegramUserId, text);
    return { ok: true };
  }

  async addComplaint(defectId: string, dto: AddComplaintDto): Promise<DefectComplaint> {
    await this.findOne(defectId);
    const maxIdxRaw = await this.complaintRepository
      .createQueryBuilder('complaint')
      .select('COALESCE(MAX(complaint.idx), 0)', 'max')
      .where('complaint.defectId = :defectId', { defectId })
      .getRawOne<{ max: string }>();

    const complaint = this.complaintRepository.create({
      defectId,
      idx: Number(maxIdxRaw?.max ?? 0) + 1,
      complaintText: dto.complaintText,
      diagnosticStatus: DiagnosticStatus.NEED_REPLY,
      approvalStatus: ApprovalStatus.PENDING,
    });
    return this.complaintRepository.save(complaint);
  }

  async updateComplaint(id: string, dto: UpdateComplaintDto): Promise<DefectComplaint> {
    const complaint = await this.getComplaintOrThrow(id);
    Object.assign(complaint, dto);
    return this.complaintRepository.save(complaint);
  }

  async updateComplaintApproval(id: string, dto: UpdateComplaintApprovalDto): Promise<DefectComplaint> {
    const complaint = await this.getComplaintOrThrow(id);
    complaint.approvalStatus = dto.approvalStatus;
    return this.complaintRepository.save(complaint);
  }

  async addLabor(complaintId: string, dto: CreateComplaintLaborDto): Promise<ComplaintLabor> {
    await this.getComplaintOrThrow(complaintId);
    const labor = this.complaintLaborRepository.create({ complaintId, ...dto });
    return this.complaintLaborRepository.save(labor);
  }

  async updateLabor(id: string, dto: UpdateComplaintLaborDto): Promise<ComplaintLabor> {
    const labor = await this.complaintLaborRepository.findOne({ where: { id } });
    if (!labor) throw new NotFoundException(`Complaint labor with id ${id} not found`);
    Object.assign(labor, dto);
    return this.complaintLaborRepository.save(labor);
  }

  async deleteLabor(id: string): Promise<{ deleted: true }> {
    const result = await this.complaintLaborRepository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Complaint labor with id ${id} not found`);
    return { deleted: true };
  }

  async addPart(complaintId: string, dto: CreateComplaintPartDto): Promise<ComplaintPart> {
    await this.getComplaintOrThrow(complaintId);
    const part = this.complaintPartRepository.create({ complaintId, ...dto });
    return this.complaintPartRepository.save(part);
  }

  async updatePart(id: string, dto: UpdateComplaintPartDto): Promise<ComplaintPart> {
    const part = await this.complaintPartRepository.findOne({ where: { id } });
    if (!part) throw new NotFoundException(`Complaint part with id ${id} not found`);
    Object.assign(part, dto);
    return this.complaintPartRepository.save(part);
  }

  async deletePart(id: string): Promise<{ deleted: true }> {
    const result = await this.complaintPartRepository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Complaint part with id ${id} not found`);
    return { deleted: true };
  }

  async assignMechanic(defectId: string, dto: AssignMechanicDto): Promise<any> {
    const defect = await this.defectRepository.findOne({
      where: { id: defectId },
      relations: { complaints: true, client: true, car: true },
      order: { complaints: { idx: 'ASC' } },
    });
    if (!defect) throw new NotFoundException(`Defect with id ${defectId} not found`);

    const mechanic = await this.userRepository.findOne({ where: { id: dto.mechanicId } });
    if (!mechanic || mechanic.role !== UserRole.MECHANIC) {
      throw new NotFoundException(`Mechanic with id ${dto.mechanicId} not found`);
    }

    defect.assignedMechanicId = dto.mechanicId;
    defect.status = DefectStatus.ASSIGNED;
    await this.defectRepository.save(defect);

    await this.complaintRepository.update(
      { defectId, diagnosticStatus: DiagnosticStatus.REPLIED, diagnosticText: IsNull() },
      { diagnosticStatus: DiagnosticStatus.NEED_REPLY },
    );
    await this.complaintRepository.update(
      { defectId, diagnosticStatus: DiagnosticStatus.REPLIED, diagnosticText: '' },
      { diagnosticStatus: DiagnosticStatus.NEED_REPLY },
    );

    const refreshed = await this.findOne(defectId);
    await this.notifyMechanic(mechanic, refreshed);
    return refreshed;
  }

  private async getDefectWithDetailsOrThrow(id: string): Promise<Defect> {
    const defect = await this.defectRepository.findOne({
      where: { id },
      relations: { complaints: { labors: true, parts: true }, client: true, car: true },
      order: { complaints: { idx: 'ASC' } },
    });

    if (!defect) {
      throw new NotFoundException(`Defect with id ${id} not found`);
    }

    return defect;
  }

  private async getComplaintOrThrow(id: string): Promise<DefectComplaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id } });
    if (!complaint) throw new NotFoundException(`Complaint with id ${id} not found`);
    return complaint;
  }

  private attachTotals(defect: Defect): any {
    const complaints = (defect.complaints ?? []).map((complaint) => {
      const laborTotalRub = (complaint.labors ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);
      const partsTotalRub = (complaint.parts ?? []).reduce((sum, item) => sum + item.qty * item.priceRub, 0);

      return { ...complaint, laborTotalRub, partsTotalRub, totalRub: laborTotalRub + partsTotalRub };
    });

    const laborTotalRub = complaints.reduce((sum, c) => sum + c.laborTotalRub, 0);
    const partsTotalRub = complaints.reduce((sum, c) => sum + c.partsTotalRub, 0);

    return { ...defect, complaints, totals: { laborTotalRub, partsTotalRub, totalRub: laborTotalRub + partsTotalRub } };
  }

  private renderPublicDefectHtml(defect: any): string {
    const createdAt = new Date().toLocaleString('ru-RU');
    const car = defect.car ?? {};
    const client = defect.client ?? {};

    const rows = (defect.complaints ?? [])
      .map((complaint: any) => {
        const labors = (complaint.labors ?? []).length
          ? `<ul>${complaint.labors
              .map((labor: any) => `<li>${this.escapeHtml(labor.name)}: ${labor.qty} x ${labor.priceRub} = ${labor.qty * labor.priceRub} руб.</li>`)
              .join('')}</ul>`
          : '<span class="muted">-</span>';

        const parts = (complaint.parts ?? []).length
          ? `<ul>${complaint.parts
              .map((part: any) => `<li>${this.escapeHtml(part.name)}: ${part.qty} x ${part.priceRub} = ${part.qty * part.priceRub} руб.</li>`)
              .join('')}</ul>`
          : '<span class="muted">-</span>';

        const approvalLabel = complaint.approvalStatus === 'ORDER'
          ? 'В ЗН'
          : complaint.approvalStatus === 'RECOMMENDATION'
            ? 'Рекомендации'
            : 'На согласовании';

        return `
          <tr>
            <td>${complaint.idx}</td>
            <td>${this.escapeHtml(complaint.complaintText)}</td>
            <td>${complaint.diagnosticText ? this.escapeHtml(complaint.diagnosticText) : '<span class="muted">Ожидает ответа механика</span>'}</td>
            <td>${labors}</td>
            <td>${parts}</td>
            <td>${complaint.totalRub} руб.</td>
            <td>${approvalLabel}</td>
          </tr>
        `;
      })
      .join('');

    return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Дефектовка ${this.escapeHtml(defect.number)}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; color: #111; }
    .page { width: 800px; margin: 0 auto; }
    h1 { margin: 0 0 16px; font-size: 28px; }
    .meta { margin-bottom: 16px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #bbb; padding: 8px; vertical-align: top; text-align: left; }
    th { background: #f5f5f5; }
    ul { margin: 0; padding-left: 18px; }
    .totals { margin-top: 16px; font-size: 16px; }
    .muted { color: #666; }
    .actions { margin: 16px 0; }
    button { padding: 10px 14px; font-size: 14px; cursor: pointer; }
    @media print {
      body { padding: 0; }
      .page { width: auto; margin: 0; }
      .actions { display: none; }
      th, td { border-color: #888; }
      @page { size: A4; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="actions"><button onclick="window.print()">Печать</button></div>
    <h1>Дефектовка ${this.escapeHtml(defect.number)}</h1>
    <div class="meta">
      <div><strong>Клиент:</strong> ${this.escapeHtml(client.name ?? '-')} (${this.escapeHtml(client.phone ?? '-')})</div>
      <div><strong>Авто:</strong> ${this.escapeHtml(car.brand ?? '-')} ${this.escapeHtml(car.model ?? '-')} ${car.year ?? ''} ${this.escapeHtml(car.plate ?? '')}</div>
      <div><strong>VIN:</strong> ${this.escapeHtml(car.vin ?? '-')}</div>
      <div><strong>Пробег:</strong> ${car.mileage ?? '-'} км</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Жалоба</th>
          <th>Диагностика</th>
          <th>Работы</th>
          <th>Запчасти</th>
          <th>Итого по жалобе</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="7">Нет жалоб</td></tr>'}
      </tbody>
    </table>

    <div class="totals">
      <div><strong>Итоги по дефектовке:</strong></div>
      <div>Работы: ${defect.totals?.laborTotalRub ?? 0} руб.</div>
      <div>Запчасти: ${defect.totals?.partsTotalRub ?? 0} руб.</div>
      <div><strong>Итого: ${defect.totals?.totalRub ?? 0} руб.</strong></div>
    </div>

    <div class="meta muted">Дата формирования: ${createdAt}</div>
  </div>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatDefectNumber(year: number, value: number): string {
    return `ДФ-${year}-${String(value).padStart(6, '0')}`;
  }

  private async notifyMechanic(mechanic: User, defect: any): Promise<void> {
    if (!mechanic.telegramUserId) return;

    const complaintsText = (defect.complaints ?? []).map((c: DefectComplaint) => `${c.idx}. ${c.complaintText}`).join('\n');

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

  private async sendTelegramMessage(chatId: string, text: string, replyMarkup?: Record<string, unknown>): Promise<void> {
    if (!this.botToken || this.botToken === 'PUT_YOUR_TOKEN_HERE') return;

    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API sendMessage failed with status ${response.status}`);
    }
  }
}
