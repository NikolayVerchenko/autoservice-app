import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('counters')
@Unique(['key', 'year'])
export class Counter {
  @PrimaryColumn({ type: 'varchar' })
  key: string;

  @PrimaryColumn({ type: 'int' })
  year: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  lastValue: number;
}
