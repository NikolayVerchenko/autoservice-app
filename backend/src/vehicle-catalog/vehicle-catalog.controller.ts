import { Controller, Get, Query } from '@nestjs/common';
import { FindVehicleModelsDto } from './dto/find-vehicle-models.dto';
import { VehicleBrand } from './vehicle-brand.entity';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleCatalogService } from './vehicle-catalog.service';

@Controller()
export class VehicleCatalogController {
  constructor(private readonly vehicleCatalogService: VehicleCatalogService) {}

  @Get('vehicle-brands')
  listBrands(): Promise<VehicleBrand[]> {
    return this.vehicleCatalogService.listBrands();
  }

  @Get('vehicle-models')
  listModels(@Query() query: FindVehicleModelsDto): Promise<VehicleModel[]> {
    return this.vehicleCatalogService.listModels(query.brandId);
  }
}

