import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  telegramUserId?: string;

  @IsOptional()
  @IsUUID()
  primaryCarId?: string;
}
