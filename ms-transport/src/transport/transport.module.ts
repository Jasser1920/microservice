import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { TransportBooking } from './entities/transport-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransportBooking])],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService, TypeOrmModule],
})
export class TransportModule {}
