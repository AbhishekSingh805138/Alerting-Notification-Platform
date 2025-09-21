import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Alert } from './Alert';
import { NotificationDelivery } from './NotificationDelivery';
import { Team } from './Team';
import { UserAlertPreference } from './UserAlertPreference';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Team, (team) => team.users, { nullable: true })
  team!: Team | null;

  @ManyToMany(() => Alert, (alert) => alert.users)
  targetedAlerts!: Alert[];

  @OneToMany(() => UserAlertPreference, (pref) => pref.user)
  alertPreferences!: UserAlertPreference[];

  @OneToMany(() => NotificationDelivery, (delivery) => delivery.user)
  deliveries!: NotificationDelivery[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
