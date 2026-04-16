import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column()
  phone!: string;

  @Column({ unique: true })
  licenseNumber!: string;

  @Column({ default: true })
  available!: boolean;
}
