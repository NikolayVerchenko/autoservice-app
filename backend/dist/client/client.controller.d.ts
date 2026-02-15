import { ConfigService } from '@nestjs/config';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './client.entity';
import { ClientService } from './client.service';
export declare class ClientController {
    private readonly clientService;
    private readonly configService;
    constructor(clientService: ClientService, configService: ConfigService);
    create(createClientDto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: string): Promise<Client>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<Client>;
    remove(id: string): Promise<{
        deleted: true;
    }>;
    refreshTelegramToken(id: string): Promise<{
        tgInviteToken: string | null;
        tgLink: string;
    }>;
    getTelegramLink(id: string): Promise<{
        tgInviteToken: string | null;
        tgLink: string;
    }>;
    private buildTelegramLink;
}
