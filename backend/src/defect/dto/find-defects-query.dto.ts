import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DefectStatus } from '../defect.enums';

export class FindDefectsQueryDto {
  @IsOptional()
  @IsEnum(DefectStatus)
  status?: DefectStatus;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  carId?: string;
}
