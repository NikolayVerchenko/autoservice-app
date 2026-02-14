import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../car/car.entity';
import { Client } from '../client/client.entity';
import { Defect } from '../defect/defect.entity';
import { Appointment } from './appointment.entity';
import { AppointmentStatus } from './appointment.enums';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Defect)
    private readonly defectRepository: Repository<Defect>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const client = await this.clientRepository.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException(`Client with id ${dto.clientId} not found`);

    const car = await this.carRepository.findOne({ where: { id: dto.carId } });
    if (!car) throw new NotFoundException(`Car with id ${dto.carId} not found`);
    if (car.clientId !== dto.clientId) throw new BadRequestException('Car does not belong to client');

    let defectId: string | null = null;
    if (dto.defectId) {
      const defect = await this.defectRepository.findOne({ where: { id: dto.defectId } });
      if (!defect) throw new NotFoundException(`Defect with id ${dto.defectId} not found`);
      defectId = defect.id;
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (startAt >= endAt) {
      throw new BadRequestException('startAt must be earlier than endAt');
    }

    const occupied = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where(':startAt < appointment.endAt', { startAt: startAt.toISOString() })
      .andWhere(':endAt > appointment.startAt', { endAt: endAt.toISOString() })
      .getOne();

    if (occupied) {
      throw new BadRequestException('Time slot already occupied');
    }

    const appointment = this.appointmentRepository.create({
      clientId: dto.clientId,
      carId: dto.carId,
      defectId,
      startAt,
      endAt,
      status: AppointmentStatus.PLANNED,
      comment: dto.comment ?? null,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(query: FindAppointmentsQueryDto): Promise<Appointment[]> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.car', 'car')
      .leftJoinAndSelect('appointment.defect', 'defect')
      .orderBy('appointment.startAt', 'ASC');

    if (query.from) {
      qb.andWhere('appointment.startAt >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('appointment.endAt <= :to', { to: query.to });
    }

    if (query.status) {
      qb.andWhere('appointment.status = :status', { status: query.status });
    }

    if (query.clientId) {
      qb.andWhere('appointment.clientId = :clientId', { clientId: query.clientId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: { client: true, car: true, defect: true },
    });

    if (!appointment) throw new NotFoundException(`Appointment with id ${id} not found`);
    return appointment;
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = dto.status;
    return this.appointmentRepository.save(appointment);
  }
}
