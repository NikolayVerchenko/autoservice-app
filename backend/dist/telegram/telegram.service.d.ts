import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ClientService } from '../client/client.service';
import { DefectComplaint } from '../defect/defect-complaint.entity';
import { Defect } from '../defect/defect.entity';
import { UserService } from '../user/user.service';
import { TelegramSession } from './telegram-session.entity';
export declare class TelegramService {
    private readonly clientService;
    private readonly userService;
    private readonly configService;
    private readonly sessionRepository;
    private readonly defectRepository;
    private readonly complaintRepository;
    private readonly botToken;
    constructor(clientService: ClientService, userService: UserService, configService: ConfigService, sessionRepository: Repository<TelegramSession>, defectRepository: Repository<Defect>, complaintRepository: Repository<DefectComplaint>);
    handleUpdate(update: any): Promise<void>;
    sendMessage(chatId: number | string, text: string, replyMarkup?: Record<string, unknown>): Promise<void>;
    private handleClientLink;
    private handleCallbackQuery;
    private showComplaintList;
    private showComplaintCard;
    private startEnteringDiagnosis;
    private handleDiagnosisTextInput;
    private finishDiagnosis;
    private getOrCreateSession;
    private answerCallbackQuery;
}
