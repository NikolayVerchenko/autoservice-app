import { IsOptional, IsUUID } from 'class-validator';

export class FindVehicleModelsDto {
  @IsOptional()
  @IsUUID()
  brandId?: string;
}

