import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { VehicleBrand } from './vehicle-brand.entity';

@Entity('vehicle_models')
@Unique('uq_vehicle_model_brand_name', ['brandId', 'name'])
export class VehicleModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  brandId: string;

  @ManyToOne(() => VehicleBrand, (brand) => brand.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: VehicleBrand;

  @Column({ type: 'varchar' })
  name: string;
}

