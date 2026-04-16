import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { NotificationChannel } from '../../enums/notification-channel.enum';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bookingId!: number;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel!: NotificationChannel;

  @Column()
  message!: string;

  @Column({ default: 'SENT' })
  status!: string;

  @CreateDateColumn()
  sentAt!: Date;
}
