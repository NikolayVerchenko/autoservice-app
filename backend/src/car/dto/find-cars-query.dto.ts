import { IsOptional, IsUUID } from 'class-validator';

export class FindCarsQueryDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
