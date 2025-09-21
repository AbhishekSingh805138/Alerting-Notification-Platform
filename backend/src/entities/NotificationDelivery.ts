import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Alert } from './Alert';
import { DeliveryType } from './AlertEnums';
import { User } from './User';

export enum DeliveryStatus {
  DELIVERED = 'delivered',
  READ = 'read',
  SNOOZED = 'snoozed',
}

@Entity('notification_deliveries')
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Alert, (alert) => alert.deliveries, { onDelete: 'CASCADE' })
  alert!: Alert;

  @ManyToOne(() => User, (user) => user.deliveries, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ name: 'delivery_type', type: 'enum', enum: DeliveryType, default: DeliveryType.IN_APP })
  deliveryType!: DeliveryType;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.DELIVERED })
  status!: DeliveryStatus;

  @CreateDateColumn({ name: 'delivered_at' })
  deliveredAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

