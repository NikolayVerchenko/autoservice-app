import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../appointment.enums';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
