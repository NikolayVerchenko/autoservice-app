import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindAppointmentsQueryDto): Promise<Appointment[]> {
    return this.appointmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    return this.appointmentService.updateStatus(id, dto);
  }
}
