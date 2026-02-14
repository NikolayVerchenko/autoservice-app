import { Body, Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any): Promise<{ ok: true }> {
    await this.telegramService.handleUpdate(update);

    return { ok: true };
  }
}
