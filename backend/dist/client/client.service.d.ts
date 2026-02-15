import { Repository } from 'typeorm';
import { Car } from '../car/car.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './client.entity';
export declare class ClientService {
    private readonly clientRepository;
    private readonly carRepository;
    constructor(clientRepository: Repository<Client>, carRepository: Repository<Car>);
    create(createClientDto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    findOneByInviteToken(token: string): Promise<Client | null>;
    linkTelegram(client: Client, telegramUserId: string): Promise<Client>;
    refreshInviteToken(id: string): Promise<Client>;
    findOneByTelegramUserId(telegramUserId: string): Promise<Client | null>;
    update(id: string, dto: UpdateClientDto): Promise<Client>;
    remove(id: string): Promise<{
        deleted: true;
    }>;
}
