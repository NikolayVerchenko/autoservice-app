import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateComplaintPartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  qty: number;

  @IsInt()
  @Min(0)
  priceRub: number;

  @IsBoolean()
  fromStock: boolean;
}
