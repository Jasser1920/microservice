import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  plateNumber!: string;

  @Column()
  model!: string;

  @Column()
  type!: string;

  @Column()
  capacity!: number;

  @Column({ default: true })
  available!: boolean;
}
