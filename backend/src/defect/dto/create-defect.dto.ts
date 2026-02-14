import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDefectComplaintDto {
  @IsString()
  @IsNotEmpty()
  complaintText: string;
}

export class CreateDefectDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  carId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDefectComplaintDto)
  complaints: CreateDefectComplaintDto[];
}
