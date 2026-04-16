import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { NotificationChannel } from '../../enums/notification-channel.enum';

export class UpdateNotificationLogDto {
  @IsOptional()
  @IsInt()
  bookingId?: number;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
