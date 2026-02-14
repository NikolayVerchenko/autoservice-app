import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
export declare class AppointmentController {
    private readonly appointmentService;
    constructor(appointmentService: AppointmentService);
    create(dto: CreateAppointmentDto): Promise<Appointment>;
    findAll(query: FindAppointmentsQueryDto): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment>;
    updateStatus(id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment>;
}
