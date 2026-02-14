"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const car_entity_1 = require("../car/car.entity");
const client_entity_1 = require("../client/client.entity");
const defect_entity_1 = require("../defect/defect.entity");
const appointment_entity_1 = require("./appointment.entity");
const appointment_enums_1 = require("./appointment.enums");
let AppointmentService = class AppointmentService {
    appointmentRepository;
    clientRepository;
    carRepository;
    defectRepository;
    constructor(appointmentRepository, clientRepository, carRepository, defectRepository) {
        this.appointmentRepository = appointmentRepository;
        this.clientRepository = clientRepository;
        this.carRepository = carRepository;
        this.defectRepository = defectRepository;
    }
    async create(dto) {
        const client = await this.clientRepository.findOne({ where: { id: dto.clientId } });
        if (!client)
            throw new common_1.NotFoundException(`Client with id ${dto.clientId} not found`);
        const car = await this.carRepository.findOne({ where: { id: dto.carId } });
        if (!car)
            throw new common_1.NotFoundException(`Car with id ${dto.carId} not found`);
        if (car.clientId !== dto.clientId)
            throw new common_1.BadRequestException('Car does not belong to client');
        let defectId = null;
        if (dto.defectId) {
            const defect = await this.defectRepository.findOne({ where: { id: dto.defectId } });
            if (!defect)
                throw new common_1.NotFoundException(`Defect with id ${dto.defectId} not found`);
            defectId = defect.id;
        }
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);
        if (startAt >= endAt) {
            throw new common_1.BadRequestException('startAt must be earlier than endAt');
        }
        const occupied = await this.appointmentRepository
            .createQueryBuilder('appointment')
            .where(':startAt < appointment.endAt', { startAt: startAt.toISOString() })
            .andWhere(':endAt > appointment.startAt', { endAt: endAt.toISOString() })
            .getOne();
        if (occupied) {
            throw new common_1.BadRequestException('Time slot already occupied');
        }
        const appointment = this.appointmentRepository.create({
            clientId: dto.clientId,
            carId: dto.carId,
            defectId,
            startAt,
            endAt,
            status: appointment_enums_1.AppointmentStatus.PLANNED,
            comment: dto.comment ?? null,
        });
        return this.appointmentRepository.save(appointment);
    }
    async findAll(query) {
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
    async findOne(id) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: { client: true, car: true, defect: true },
        });
        if (!appointment)
            throw new common_1.NotFoundException(`Appointment with id ${id} not found`);
        return appointment;
    }
    async updateStatus(id, dto) {
        const appointment = await this.findOne(id);
        appointment.status = dto.status;
        return this.appointmentRepository.save(appointment);
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(2, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(3, (0, typeorm_1.InjectRepository)(defect_entity_1.Defect)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map