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
exports.CarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_service_1 = require("../client/client.service");
const car_entity_1 = require("./car.entity");
let CarService = class CarService {
    carRepository;
    clientService;
    constructor(carRepository, clientService) {
        this.carRepository = carRepository;
        this.clientService = clientService;
    }
    async create(createCarDto) {
        await this.clientService.findOne(createCarDto.clientId);
        const car = this.carRepository.create(createCarDto);
        return this.carRepository.save(car);
    }
    findAll(query) {
        return this.carRepository.find({
            where: query.clientId ? { clientId: query.clientId } : {},
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const car = await this.carRepository.findOne({ where: { id } });
        if (!car) {
            throw new common_1.NotFoundException(`Car with id ${id} not found`);
        }
        return car;
    }
    async update(id, dto) {
        const car = await this.findOne(id);
        if (typeof dto.clientId === 'string') {
            await this.clientService.findOne(dto.clientId);
            car.clientId = dto.clientId;
        }
        if (typeof dto.brand === 'string') {
            car.brand = dto.brand;
        }
        if (typeof dto.model === 'string') {
            car.model = dto.model;
        }
        if (typeof dto.year === 'number') {
            car.year = dto.year;
        }
        if (typeof dto.vin === 'string') {
            car.vin = dto.vin.trim() || null;
        }
        if (typeof dto.plate === 'string') {
            car.plate = dto.plate.trim() || null;
        }
        if (typeof dto.mileage === 'number') {
            car.mileage = dto.mileage;
        }
        return this.carRepository.save(car);
    }
    async remove(id) {
        const car = await this.findOne(id);
        await this.carRepository.remove(car);
        return { deleted: true };
    }
};
exports.CarService = CarService;
exports.CarService = CarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        client_service_1.ClientService])
], CarService);
//# sourceMappingURL=car.service.js.map