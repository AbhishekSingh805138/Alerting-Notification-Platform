"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./config/env");
const Alert_1 = require("./entities/Alert");
const NotificationDelivery_1 = require("./entities/NotificationDelivery");
const Team_1 = require("./entities/Team");
const User_1 = require("./entities/User");
const UserAlertPreference_1 = require("./entities/UserAlertPreference");
console.log(`TypeORM DataSource config: host=${env_1.env.db.host} db=${env_1.env.db.name} user=${env_1.env.db.user} synchronize=${true}`);
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    username: env_1.env.db.user,
    password: env_1.env.db.password,
    database: env_1.env.db.name,
    synchronize: true,
    logging: false,
    entities: [Alert_1.Alert, Team_1.Team, User_1.User, UserAlertPreference_1.UserAlertPreference, NotificationDelivery_1.NotificationDelivery],
});
