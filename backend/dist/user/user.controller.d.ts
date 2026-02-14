import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto): Promise<User>;
    findAll(query: FindUsersQueryDto): Promise<User[]>;
    findOne(id: string): Promise<User>;
}
