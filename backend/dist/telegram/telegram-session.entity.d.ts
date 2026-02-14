import { User } from '../user/user.entity';
import { TelegramSessionState } from './telegram-session.enums';
export declare class TelegramSession {
    id: string;
    userId: string;
    user: User;
    activeDefectId: string | null;
    activeComplaintId: string | null;
    state: TelegramSessionState;
    updatedAt: Date;
}
