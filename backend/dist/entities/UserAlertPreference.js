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
exports.UserAlertPreference = void 0;
const typeorm_1 = require("typeorm");
const Alert_1 = require("./Alert");
const User_1 = require("./User");
let UserAlertPreference = class UserAlertPreference {
};
exports.UserAlertPreference = UserAlertPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserAlertPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.alertPreferences, { onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], UserAlertPreference.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alert_1.Alert, (alert) => alert.userPreferences, { onDelete: 'CASCADE' }),
    __metadata("design:type", Alert_1.Alert)
], UserAlertPreference.prototype, "alert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', default: false }),
    __metadata("design:type", Boolean)
], UserAlertPreference.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snoozed_until', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], UserAlertPreference.prototype, "snoozedUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_reminder_at', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], UserAlertPreference.prototype, "lastReminderAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_delivered_at', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], UserAlertPreference.prototype, "lastDeliveredAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserAlertPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserAlertPreference.prototype, "updatedAt", void 0);
exports.UserAlertPreference = UserAlertPreference = __decorate([
    (0, typeorm_1.Entity)('user_alert_preferences'),
    (0, typeorm_1.Unique)(['user', 'alert'])
], UserAlertPreference);
