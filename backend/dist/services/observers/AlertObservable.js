"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertObservable = exports.NotificationObserver = void 0;
class NotificationObserver {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    async handle(alert, user, context) {
        await this.dispatcher.dispatch(alert, user, context);
    }
}
exports.NotificationObserver = NotificationObserver;
class AlertObservable {
    constructor(initialObservers = []) {
        this.observers = [];
        this.observers.push(...initialObservers);
    }
    register(observer) {
        this.observers.push(observer);
    }
    async notify(alert, user, context) {
        for (const observer of this.observers) {
            await observer.handle(alert, user, context);
        }
    }
}
exports.AlertObservable = AlertObservable;
