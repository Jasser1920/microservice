import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { UpdateTransportBookingDto } from './dto/update-transport-booking.dto';
import { TransportBooking } from './entities/transport-booking.entity';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post()
  create(
    @Body() createTransportBookingDto: CreateTransportBookingDto,
  ): Promise<TransportBooking> {
    return this.transportService.create(createTransportBookingDto);
  }

  @Get()
  findAll(): Promise<TransportBooking[]> {
    return this.transportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TransportBooking> {
    return this.transportService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransportBookingDto: UpdateTransportBookingDto,
  ): Promise<TransportBooking> {
    return this.transportService.update(id, updateTransportBookingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.transportService.remove(id);
  }
}
