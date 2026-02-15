import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService {
  private readonly singletonId = 1;

  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly configService: ConfigService,
  ) {}

  async get(): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({ where: { id: this.singletonId } });
    if (!settings) {
      settings = this.settingsRepository.create({
        id: this.singletonId,
        publicBotUsername: this.configService.get<string>('PUBLIC_BOT_USERNAME') ?? null,
        publicAppUrl: this.configService.get<string>('PUBLIC_APP_URL') ?? null,
        telegramBotToken: this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? null,
      });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.get();

    if (typeof dto.publicBotUsername === 'string') {
      settings.publicBotUsername = dto.publicBotUsername.trim() || null;
    }

    if (typeof dto.publicAppUrl === 'string') {
      settings.publicAppUrl = dto.publicAppUrl.trim() || null;
    }

    if (typeof dto.telegramBotToken === 'string') {
      settings.telegramBotToken = dto.telegramBotToken.trim() || null;
    }

    return this.settingsRepository.save(settings);
  }

  async getPublicBotUsername(): Promise<string> {
    const settings = await this.get();
    return settings.publicBotUsername || this.configService.get<string>('PUBLIC_BOT_USERNAME') || '';
  }

  async getTelegramBotToken(): Promise<string> {
    const settings = await this.get();
    return settings.telegramBotToken || this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }
}
