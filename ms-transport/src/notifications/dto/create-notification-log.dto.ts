import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { NotificationChannel } from '../../enums/notification-channel.enum';

export class CreateNotificationLogDto {
  @IsInt()
  bookingId!: number;

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
