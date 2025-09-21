"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcher = void 0;
const data_source_1 = require("../data-source");
const Alert_1 = require("../entities/Alert");
const NotificationDelivery_1 = require("../entities/NotificationDelivery");
class InAppNotificationStrategy {
    constructor(deliveryRepo) {
        this.deliveryRepo = deliveryRepo;
        this.type = Alert_1.DeliveryType.IN_APP;
    }
    async deliver(alert, user, context) {
        const delivery = this.deliveryRepo.create({
            alert,
            user,
            deliveryType: this.type,
            status: context.status,
        });
        await this.deliveryRepo.save(delivery);
    }
}
class NotificationDispatcher {
    constructor(strategies) {
        this.strategies = new Map();
        const deliveryRepo = data_source_1.AppDataSource.getRepository(NotificationDelivery_1.NotificationDelivery);
        const registered = strategies ?? [new InAppNotificationStrategy(deliveryRepo)];
        if (!registered.length) {
            throw new Error('At least one notification strategy must be registered');
        }
        for (const strategy of registered) {
            this.strategies.set(strategy.type, strategy);
        }
        this.fallback = registered[0];
    }
    async dispatch(alert, user, context) {
        const strategy = this.strategies.get(alert.deliveryType) ?? this.fallback;
        await strategy.deliver(alert, user, context);
    }
}
exports.NotificationDispatcher = NotificationDispatcher;
