import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleBrand } from './vehicle-brand.entity';
import { VehicleModel } from './vehicle-model.entity';

const DEFAULT_CATALOG: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'],
  BMW: ['3 Series', '5 Series', 'X5', 'X6'],
  Mercedes: ['E-Class', 'S-Class', 'GLC', 'GLE'],
  Audi: ['A4', 'A6', 'Q5', 'Q7'],
  Volkswagen: ['Polo', 'Passat', 'Tiguan', 'Touareg'],
  Kia: ['Rio', 'Ceed', 'Sportage', 'Sorento'],
  Hyundai: ['Solaris', 'Elantra', 'Tucson', 'Santa Fe'],
  Lada: ['Vesta', 'Granta', 'Niva'],
  Nissan: ['Almera', 'Qashqai', 'X-Trail'],
  LandRover: ['Discovery', 'Range Rover', 'Defender'],
};

@Injectable()
export class VehicleCatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(VehicleBrand)
    private readonly brandRepository: Repository<VehicleBrand>,
    @InjectRepository(VehicleModel)
    private readonly modelRepository: Repository<VehicleModel>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.brandRepository.count();
    if (count > 0) return;

    for (const [brandName, models] of Object.entries(DEFAULT_CATALOG)) {
      const brand = await this.brandRepository.save(
        this.brandRepository.create({
          name: brandName,
        }),
      );

      for (const modelName of models) {
        await this.modelRepository.save(
          this.modelRepository.create({
            brandId: brand.id,
            name: modelName,
          }),
        );
      }
    }
  }

  listBrands(): Promise<VehicleBrand[]> {
    return this.brandRepository.find({
      order: { name: 'ASC' },
    });
  }

  listModels(brandId?: string): Promise<VehicleModel[]> {
    return this.modelRepository.find({
      where: brandId ? { brandId } : {},
      order: { name: 'ASC' },
    });
  }
}

