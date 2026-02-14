import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateComplaintLaborDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  qty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceRub?: number;
}
