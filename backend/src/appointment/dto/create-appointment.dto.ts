import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  carId: string;

  @IsOptional()
  @IsUUID()
  defectId?: string | null;

  @Type(() => String)
  @IsDateString()
  startAt: string;

  @Type(() => String)
  @IsDateString()
  endAt: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
