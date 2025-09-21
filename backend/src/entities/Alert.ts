import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationDelivery } from './NotificationDelivery';
import { Team } from './Team';
import { User } from './User';
import { UserAlertPreference } from './UserAlertPreference';
import { AlertSeverity, DeliveryType } from './AlertEnums';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'enum', enum: AlertSeverity, default: AlertSeverity.INFO })
  severity!: AlertSeverity;

  @Column({ type: 'enum', enum: DeliveryType, default: DeliveryType.IN_APP })
  deliveryType!: DeliveryType;

  @Column({ name: 'reminder_frequency_minutes', type: 'int', default: 120 })
  reminderFrequencyMinutes!: number;

  @Column({ name: 'start_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamp with time zone', nullable: true })
  endAt!: Date | null;

  @Column({ name: 'reminders_enabled', default: true })
  remindersEnabled!: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived!: boolean;

  @Column({ name: 'visible_to_organization', default: false })
  visibleToOrganization!: boolean;

  @ManyToMany(() => Team, (team) => team.alerts, { cascade: true })
  @JoinTable({
    name: 'alert_teams',
    joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'team_id', referencedColumnName: 'id' },
  })
  teams!: Team[];

  @ManyToMany(() => User, (user) => user.targetedAlerts, { cascade: true })
  @JoinTable({
    name: 'alert_users',
    joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users!: User[];

  @OneToMany(() => UserAlertPreference, (pref) => pref.alert)
  userPreferences!: UserAlertPreference[];

  @OneToMany(() => NotificationDelivery, (delivery) => delivery.alert)
  deliveries!: NotificationDelivery[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export { AlertSeverity, DeliveryType } from './AlertEnums';

