import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { UpdateTransportBookingDto } from './dto/update-transport-booking.dto';
import { TransportBooking } from './entities/transport-booking.entity';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(TransportBooking)
    private readonly transportRepository: Repository<TransportBooking>,
  ) {}

  async create(
    createTransportBookingDto: CreateTransportBookingDto,
  ): Promise<TransportBooking> {
    const booking = this.transportRepository.create({
      ...createTransportBookingDto,
      bookingId: createTransportBookingDto.bookingId ?? null,
      specialNotes: createTransportBookingDto.specialNotes ?? null,
      pickupTime: new Date(createTransportBookingDto.pickupTime),
    });

    return this.transportRepository.save(booking);
  }

  findAll(): Promise<TransportBooking[]> {
    return this.transportRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TransportBooking> {
    const booking = await this.transportRepository.findOneBy({ id });

    if (!booking) {
      throw new NotFoundException(`Transport booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(
    id: number,
    updateTransportBookingDto: UpdateTransportBookingDto,
  ): Promise<TransportBooking> {
    const booking = await this.findOne(id);

    const nextPickupTime =
      updateTransportBookingDto.pickupTime === undefined
        ? booking.pickupTime
        : new Date(updateTransportBookingDto.pickupTime);

    Object.assign(booking, {
      ...updateTransportBookingDto,
      pickupTime: nextPickupTime,
    });

    if (updateTransportBookingDto.bookingId !== undefined) {
      booking.bookingId = updateTransportBookingDto.bookingId;
    }

    if (updateTransportBookingDto.specialNotes !== undefined) {
      booking.specialNotes = updateTransportBookingDto.specialNotes;
    }

    return this.transportRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.transportRepository.remove(booking);
  }
}
