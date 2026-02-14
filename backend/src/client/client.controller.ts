import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from './client.entity';
import { ClientService } from './client.service';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Client> {
    return this.clientService.findOne(id);
  }

  @Post(':id/tg-refresh-token')
  async refreshTelegramToken(@Param('id') id: string): Promise<{
    tgInviteToken: string | null;
    tgLink: string;
  }> {
    const client = await this.clientService.refreshInviteToken(id);

    return {
      tgInviteToken: client.tgInviteToken,
      tgLink: this.buildTelegramLink(client.tgInviteToken),
    };
  }

  @Get(':id/tg-link')
  async getTelegramLink(@Param('id') id: string): Promise<{
    tgInviteToken: string | null;
    tgLink: string;
  }> {
    const client = await this.clientService.findOne(id);

    return {
      tgInviteToken: client.tgInviteToken,
      tgLink: this.buildTelegramLink(client.tgInviteToken),
    };
  }

  private buildTelegramLink(token: string | null): string {
    const username = this.configService.get<string>('PUBLIC_BOT_USERNAME') ?? '';
    const safeToken = token ?? '';

    return `https://t.me/${username}?start=link_${safeToken}`;
  }
}
