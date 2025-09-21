"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const AlertService_1 = require("../services/AlertService");
class UserController {
    constructor(alertService = new AlertService_1.AlertService()) {
        this.alertService = alertService;
        this.getAlerts = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const includeSnoozed = req.query.includeSnoozed === 'true';
                const alerts = await this.alertService.fetchUserAlerts(userId, { includeSnoozed });
                const now = new Date();
                const mapped = alerts.map(({ alert, preference }) => {
                    const snoozedUntil = preference.snoozedUntil ? new Date(preference.snoozedUntil) : null;
                    const isSnoozed = snoozedUntil ? snoozedUntil > now : false;
                    return {
                        id: alert.id,
                        title: alert.title,
                        message: alert.message,
                        severity: alert.severity,
                        deliveryType: alert.deliveryType,
                        reminderFrequencyMinutes: alert.reminderFrequencyMinutes,
                        startAt: alert.startAt,
                        endAt: alert.endAt,
                        remindersEnabled: alert.remindersEnabled,
                        isRead: preference.isRead,
                        isSnoozed,
                        snoozedUntil: preference.snoozedUntil,
                        lastReminderAt: preference.lastReminderAt,
                    };
                });
                res.json(mapped);
            }
            catch (error) {
                next(error);
            }
        };
        this.setAlertReadState = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const alertId = req.params.alertId;
                const { isRead } = req.body;
                const preference = await this.alertService.markAlertRead(userId, alertId, Boolean(isRead));
                res.json(preference);
            }
            catch (error) {
                next(error);
            }
        };
        this.snoozeAlert = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const alertId = req.params.alertId;
                const preference = await this.alertService.snoozeAlert(userId, alertId);
                res.json(preference);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UserController = UserController;
