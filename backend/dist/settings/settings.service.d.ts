import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './settings.entity';
export declare class SettingsService {
    private readonly settingsRepository;
    private readonly configService;
    private readonly singletonId;
    constructor(settingsRepository: Repository<Settings>, configService: ConfigService);
    get(): Promise<Settings>;
    update(dto: UpdateSettingsDto): Promise<Settings>;
    getPublicBotUsername(): Promise<string>;
}
