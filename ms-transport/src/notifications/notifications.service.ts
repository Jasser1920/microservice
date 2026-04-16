import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateNotificationLogDto } from './dto/create-notification-log.dto';
import { UpdateNotificationLogDto } from './dto/update-notification-log.dto';
import { NotificationLog } from './entities/notification-log.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationsRepository: Repository<NotificationLog>,
  ) {}

  create(
    createNotificationLogDto: CreateNotificationLogDto,
  ): Promise<NotificationLog> {
    const notification = this.notificationsRepository.create(
      createNotificationLogDto,
    );
    return this.notificationsRepository.save(notification);
  }

  findAll(): Promise<NotificationLog[]> {
    return this.notificationsRepository.find({
      order: { sentAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<NotificationLog> {
    const notification = await this.notificationsRepository.findOneBy({ id });

    if (!notification) {
      throw new NotFoundException(`Notification log with ID ${id} not found`);
    }

    return notification;
  }

  async update(
    id: number,
    updateNotificationLogDto: UpdateNotificationLogDto,
  ): Promise<NotificationLog> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationLogDto);
    return this.notificationsRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }
}
