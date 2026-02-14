import { Repository } from 'typeorm';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
export declare class AppointmentService {
    private readonly appointmentRepository;
    private readonly clientRepository;
    private readonly carRepository;
    private readonly defectRepository;
    constructor(appointmentRepository: Repository<Appointment>, clientRepository: Repository<Client>, carRepository: Repository<Car>, defectRepository: Repository<Defect>);
    create(dto: CreateAppointmentDto): Promise<Appointment>;
    findAll(query: FindAppointmentsQueryDto): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment>;
    updateStatus(id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment>;
}
