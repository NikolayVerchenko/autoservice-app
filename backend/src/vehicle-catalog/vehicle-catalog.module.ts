import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleBrand } from './vehicle-brand.entity';
import { VehicleCatalogController } from './vehicle-catalog.controller';
import { VehicleCatalogService } from './vehicle-catalog.service';
import { VehicleModel } from './vehicle-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleBrand, VehicleModel])],
  controllers: [VehicleCatalogController],
  providers: [VehicleCatalogService],
  exports: [VehicleCatalogService],
})
export class VehicleCatalogModule {}

