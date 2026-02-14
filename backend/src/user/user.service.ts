import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { User } from './user.entity';
import { UserRole } from './user.enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      role: dto.role,
      name: dto.name,
      login: dto.login,
      passwordHash,
      telegramUserId: dto.role === UserRole.MECHANIC ? (dto.telegramUserId ?? null) : null,
    });

    return this.userRepository.save(user);
  }

  findAll(query: FindUsersQueryDto): Promise<User[]> {
    return this.userRepository.find({
      where: query.role ? { role: query.role } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  findMechanicByTelegramUserId(telegramUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        telegramUserId,
        role: UserRole.MECHANIC,
      },
    });
  }
}
