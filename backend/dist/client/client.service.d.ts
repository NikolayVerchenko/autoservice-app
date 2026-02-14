import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from './client.entity';
export declare class ClientService {
    private readonly clientRepository;
    constructor(clientRepository: Repository<Client>);
    create(createClientDto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    findOneByInviteToken(token: string): Promise<Client | null>;
    linkTelegram(client: Client, telegramUserId: string): Promise<Client>;
    refreshInviteToken(id: string): Promise<Client>;
}
