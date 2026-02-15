import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './client.entity';
import { ClientService } from './client.service';
import { SettingsService } from '../settings/settings.service';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly settingsService: SettingsService,
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto): Promise<Client> {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: true }> {
    return this.clientService.remove(id);
  }

  @Post(':id/tg-refresh-token')
  async refreshTelegramToken(@Param('id') id: string): Promise<{
    tgInviteToken: string | null;
    tgLink: string;
  }> {
    const client = await this.clientService.refreshInviteToken(id);

    return {
      tgInviteToken: client.tgInviteToken,
      tgLink: await this.buildTelegramLink(client.tgInviteToken),
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
      tgLink: await this.buildTelegramLink(client.tgInviteToken),
    };
  }

  private async buildTelegramLink(token: string | null): Promise<string> {
    const username = await this.settingsService.getPublicBotUsername();
    const safeToken = token ?? '';

    return `https://t.me/${username}?start=link_${safeToken}`;
  }
}
