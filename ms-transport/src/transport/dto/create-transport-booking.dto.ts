import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { BookingStatus } from '../../enums/booking-status.enum';
import { TransportType } from '../../enums/transport-type.enum';

export class CreateTransportBookingDto {
  @IsInt()
  clientId!: number;

  @IsOptional()
  @IsInt()
  bookingId?: number | null;

  @IsString()
  pickupLocation!: string;

  @IsString()
  dropoffLocation!: string;

  @IsDateString()
  pickupTime!: string;

  @IsEnum(TransportType)
  type!: TransportType;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  specialNotes?: string | null;
}
