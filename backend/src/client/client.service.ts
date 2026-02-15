import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Appointment } from '../appointment/appointment.entity';
import { Car } from '../car/car.entity';
import { Defect } from '../defect/defect.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Defect)
    private readonly defectRepository: Repository<Defect>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const telegramUserId = createClientDto.telegramUserId?.trim() || null;
    const client = this.clientRepository.create({
      name: createClientDto.name,
      phone: createClientDto.phone,
      telegramUserId,
      tgLinkedAt: telegramUserId ? new Date() : null,
      tgInviteToken: randomUUID(),
      primaryCarId: null,
    });
    const saved = await this.clientRepository.save(client);

    if (createClientDto.primaryCarId) {
      const car = await this.carRepository.findOne({ where: { id: createClientDto.primaryCarId } });
      if (car && car.clientId === saved.id) {
        saved.primaryCarId = car.id;
        return this.clientRepository.save(saved);
      }
    }

    return saved;
  }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: { primaryCar: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    return client;
  }

  async findOneByInviteToken(token: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { tgInviteToken: token } });
  }

  async linkTelegram(client: Client, telegramUserId: string): Promise<Client> {
    client.telegramUserId = telegramUserId;
    client.tgLinkedAt = new Date();

    return this.clientRepository.save(client);
  }

  async refreshInviteToken(id: string): Promise<Client> {
    const client = await this.findOne(id);
    client.tgInviteToken = randomUUID();

    return this.clientRepository.save(client);
  }

  findOneByTelegramUserId(telegramUserId: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { telegramUserId } });
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (typeof dto.name === 'string') {
      client.name = dto.name;
    }

    if (typeof dto.phone === 'string') {
      client.phone = dto.phone;
    }

    if (typeof dto.telegramUserId === 'string') {
      const telegramUserId = dto.telegramUserId.trim();
      client.telegramUserId = telegramUserId || null;
      client.tgLinkedAt = telegramUserId ? new Date() : null;
    }

    if ('primaryCarId' in dto) {
      if (!dto.primaryCarId) {
        client.primaryCarId = null;
      } else {
        const car = await this.carRepository.findOne({ where: { id: dto.primaryCarId } });
        if (!car || car.clientId !== client.id) {
          throw new NotFoundException('Car not found for this client');
        }
        client.primaryCarId = car.id;
      }
    }

    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const client = await this.findOne(id);

    const [defectsCount, appointmentsCount] = await Promise.all([
      this.defectRepository.count({ where: { clientId: client.id } }),
      this.appointmentRepository.count({ where: { clientId: client.id } }),
    ]);

    if (defectsCount > 0 || appointmentsCount > 0) {
      throw new ConflictException(
        'Нельзя удалить клиента: есть связанные дефектовки или записи. Сначала удалите их.',
      );
    }

    await this.clientRepository.remove(client);
    return { deleted: true };
  }
}
