import { UserRole } from './user.enums';
export declare class User {
    id: string;
    role: UserRole;
    name: string;
    login: string;
    passwordHash: string;
    telegramUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
