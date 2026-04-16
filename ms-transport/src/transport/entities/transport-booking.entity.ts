import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BookingStatus } from '../../enums/booking-status.enum';
import { TransportType } from '../../enums/transport-type.enum';

@Entity('transport_bookings')
export class TransportBooking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clientId!: number;

  @Column({ type: 'int', nullable: true })
  bookingId!: number | null;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column({ type: 'datetime' })
  pickupTime!: Date;

  @Column({
    type: 'enum',
    enum: TransportType,
  })
  type!: TransportType;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column({ type: 'text', nullable: true })
  specialNotes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
