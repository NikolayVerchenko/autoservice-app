import { UserRole } from '../user.enums';
export declare class CreateUserDto {
    role: UserRole;
    name: string;
    login: string;
    password: string;
    telegramUserId?: string;
}
