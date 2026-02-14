import { AppointmentStatus } from '../appointment.enums';
export declare class FindAppointmentsQueryDto {
    from?: string;
    to?: string;
    status?: AppointmentStatus;
    clientId?: string;
}
