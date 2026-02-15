import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './settings.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(): Promise<Settings> {
    return this.settingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.settingsService.update(dto);
  }
}
