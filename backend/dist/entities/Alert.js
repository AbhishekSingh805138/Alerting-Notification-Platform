"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryType = exports.AlertSeverity = exports.Alert = void 0;
const typeorm_1 = require("typeorm");
const NotificationDelivery_1 = require("./NotificationDelivery");
const Team_1 = require("./Team");
const User_1 = require("./User");
const UserAlertPreference_1 = require("./UserAlertPreference");
const AlertEnums_1 = require("./AlertEnums");
let Alert = class Alert {
};
exports.Alert = Alert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Alert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Alert.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Alert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AlertEnums_1.AlertSeverity, default: AlertEnums_1.AlertSeverity.INFO }),
    __metadata("design:type", String)
], Alert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AlertEnums_1.DeliveryType, default: AlertEnums_1.DeliveryType.IN_APP }),
    __metadata("design:type", String)
], Alert.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reminder_frequency_minutes', type: 'int', default: 120 }),
    __metadata("design:type", Number)
], Alert.prototype, "reminderFrequencyMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Alert.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_at', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], Alert.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reminders_enabled', default: true }),
    __metadata("design:type", Boolean)
], Alert.prototype, "remindersEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_archived', default: false }),
    __metadata("design:type", Boolean)
], Alert.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'visible_to_organization', default: false }),
    __metadata("design:type", Boolean)
], Alert.prototype, "visibleToOrganization", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Team_1.Team, (team) => team.alerts, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'alert_teams',
        joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'team_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Alert.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, (user) => user.targetedAlerts, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'alert_users',
        joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Alert.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserAlertPreference_1.UserAlertPreference, (pref) => pref.alert),
    __metadata("design:type", Array)
], Alert.prototype, "userPreferences", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NotificationDelivery_1.NotificationDelivery, (delivery) => delivery.alert),
    __metadata("design:type", Array)
], Alert.prototype, "deliveries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Alert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Alert.prototype, "updatedAt", void 0);
exports.Alert = Alert = __decorate([
    (0, typeorm_1.Entity)('alerts')
], Alert);
var AlertEnums_2 = require("./AlertEnums");
Object.defineProperty(exports, "AlertSeverity", { enumerable: true, get: function () { return AlertEnums_2.AlertSeverity; } });
Object.defineProperty(exports, "DeliveryType", { enumerable: true, get: function () { return AlertEnums_2.DeliveryType; } });
