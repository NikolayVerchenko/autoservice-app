import { IsNotEmpty, IsString } from 'class-validator';

export class AddComplaintDto {
  @IsString()
  @IsNotEmpty()
  complaintText: string;
}
