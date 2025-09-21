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
exports.NotificationDelivery = exports.DeliveryStatus = void 0;
const typeorm_1 = require("typeorm");
const Alert_1 = require("./Alert");
const AlertEnums_1 = require("./AlertEnums");
const User_1 = require("./User");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["READ"] = "read";
    DeliveryStatus["SNOOZED"] = "snoozed";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
let NotificationDelivery = class NotificationDelivery {
};
exports.NotificationDelivery = NotificationDelivery;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationDelivery.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alert_1.Alert, (alert) => alert.deliveries, { onDelete: 'CASCADE' }),
    __metadata("design:type", Alert_1.Alert)
], NotificationDelivery.prototype, "alert", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.deliveries, { onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], NotificationDelivery.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_type', type: 'enum', enum: AlertEnums_1.DeliveryType, default: AlertEnums_1.DeliveryType.IN_APP }),
    __metadata("design:type", String)
], NotificationDelivery.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.DELIVERED }),
    __metadata("design:type", String)
], NotificationDelivery.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'delivered_at' }),
    __metadata("design:type", Date)
], NotificationDelivery.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], NotificationDelivery.prototype, "updatedAt", void 0);
exports.NotificationDelivery = NotificationDelivery = __decorate([
    (0, typeorm_1.Entity)('notification_deliveries')
], NotificationDelivery);
