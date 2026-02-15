import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  publicBotUsername?: string;

  @IsOptional()
  @IsString()
  publicAppUrl?: string;
}
