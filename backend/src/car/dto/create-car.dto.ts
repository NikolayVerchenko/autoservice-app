import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCarDto {
  @IsUUID()
  clientId: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsInt()
  mileage?: number;
}
