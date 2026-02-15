import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './settings.entity';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<Settings>;
    update(dto: UpdateSettingsDto): Promise<Settings>;
}
