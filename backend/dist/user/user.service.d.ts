import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { User } from './user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(dto: CreateUserDto): Promise<User>;
    findAll(query: FindUsersQueryDto): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findMechanicByTelegramUserId(telegramUserId: string): Promise<User | null>;
}
