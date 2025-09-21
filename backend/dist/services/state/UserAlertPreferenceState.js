"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlertPreferenceStateMachine = void 0;
const NotificationDelivery_1 = require("../../entities/NotificationDelivery");
class UnreadState {
    constructor() {
        this.name = 'unread';
    }
    setRead(machine, isRead, _now) {
        if (!isRead) {
            return null;
        }
        const pref = machine.preference;
        pref.isRead = true;
        pref.snoozedUntil = null;
        machine.transitionTo(new ReadState());
        return { status: NotificationDelivery_1.DeliveryStatus.READ, reason: 'read' };
    }
    snooze(machine, until, now) {
        const pref = machine.preference;
        pref.snoozedUntil = until;
        pref.lastReminderAt = now;
        pref.isRead = false;
        machine.transitionTo(new SnoozedState());
        return { status: NotificationDelivery_1.DeliveryStatus.SNOOZED, reason: 'snooze' };
    }
}
class ReadState {
    constructor() {
        this.name = 'read';
    }
    setRead(machine, isRead, now) {
        const pref = machine.preference;
        if (isRead) {
            pref.snoozedUntil = null;
            return { status: NotificationDelivery_1.DeliveryStatus.READ, reason: 'read' };
        }
        pref.isRead = false;
        pref.lastReminderAt = now;
        machine.transitionTo(new UnreadState());
        return null;
    }
    snooze(machine, until, now) {
        const pref = machine.preference;
        pref.isRead = false;
        pref.snoozedUntil = until;
        pref.lastReminderAt = now;
        machine.transitionTo(new SnoozedState());
        return { status: NotificationDelivery_1.DeliveryStatus.SNOOZED, reason: 'snooze' };
    }
}
class SnoozedState {
    constructor() {
        this.name = 'snoozed';
    }
    setRead(machine, isRead, now) {
        const pref = machine.preference;
        if (isRead) {
            pref.isRead = true;
            pref.snoozedUntil = null;
            pref.lastReminderAt = now;
            machine.transitionTo(new ReadState());
            return { status: NotificationDelivery_1.DeliveryStatus.READ, reason: 'read' };
        }
        pref.isRead = false;
        machine.transitionTo(new UnreadState());
        return null;
    }
    snooze(machine, until, now) {
        const pref = machine.preference;
        pref.snoozedUntil = until;
        pref.lastReminderAt = now;
        return { status: NotificationDelivery_1.DeliveryStatus.SNOOZED, reason: 'snooze' };
    }
}
class UserAlertPreferenceStateMachine {
    constructor(preference) {
        this.preference = preference;
        this.state = this.resolveState();
    }
    async setRead(isRead, now) {
        const change = this.state.setRead(this, isRead, now);
        this.state = this.resolveState();
        return change;
    }
    async snooze(until, now) {
        const change = this.state.snooze(this, until, now);
        this.state = this.resolveState();
        return change;
    }
    transitionTo(state) {
        this.state = state;
    }
    resolveState() {
        const pref = this.preference;
        const now = new Date();
        if (pref.snoozedUntil && pref.snoozedUntil.getTime() > now.getTime()) {
            return new SnoozedState();
        }
        if (pref.isRead) {
            return new ReadState();
        }
        return new UnreadState();
    }
}
exports.UserAlertPreferenceStateMachine = UserAlertPreferenceStateMachine;
