import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Alert } from './Alert';
import { User } from './User';

@Entity('user_alert_preferences')
@Unique(['user', 'alert'])
export class UserAlertPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.alertPreferences, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Alert, (alert) => alert.userPreferences, { onDelete: 'CASCADE' })
  alert!: Alert;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'snoozed_until', type: 'timestamp with time zone', nullable: true })
  snoozedUntil!: Date | null;

  @Column({ name: 'last_reminder_at', type: 'timestamp with time zone', nullable: true })
  lastReminderAt!: Date | null;

  @Column({ name: 'last_delivered_at', type: 'timestamp with time zone', nullable: true })
  lastDeliveredAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
