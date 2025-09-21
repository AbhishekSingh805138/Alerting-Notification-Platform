import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './config/env';
import { Alert } from './entities/Alert';
import { NotificationDelivery } from './entities/NotificationDelivery';
import { Team } from './entities/Team';
import { User } from './entities/User';
import { UserAlertPreference } from './entities/UserAlertPreference';

console.log(
  `TypeORM DataSource config: host=${env.db.host} db=${env.db.name} user=${env.db.user} synchronize=${true}`
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: true,
  logging: false,
  entities: [Alert, Team, User, UserAlertPreference, NotificationDelivery],
});
