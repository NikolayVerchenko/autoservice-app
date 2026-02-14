import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from './client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create({
      ...createClientDto,
      tgInviteToken: randomUUID(),
    });

    return this.clientRepository.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    return client;
  }

  async findOneByInviteToken(token: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { tgInviteToken: token } });
  }

  async linkTelegram(client: Client, telegramUserId: string): Promise<Client> {
    client.telegramUserId = telegramUserId;
    client.tgLinkedAt = new Date();

    return this.clientRepository.save(client);
  }

  async refreshInviteToken(id: string): Promise<Client> {
    const client = await this.findOne(id);
    client.tgInviteToken = randomUUID();

    return this.clientRepository.save(client);
  }
}
