import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleModel } from './vehicle-model.entity';

@Entity('vehicle_brands')
export class VehicleBrand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => VehicleModel, (model) => model.brand)
  models: VehicleModel[];
}

