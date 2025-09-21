"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const data_source_1 = require("../data-source");
const Alert_1 = require("../entities/Alert");
const NotificationDelivery_1 = require("../entities/NotificationDelivery");
const UserAlertPreference_1 = require("../entities/UserAlertPreference");
class AnalyticsService {
    constructor() {
        this.alertRepo = data_source_1.AppDataSource.getRepository(Alert_1.Alert);
        this.deliveryRepo = data_source_1.AppDataSource.getRepository(NotificationDelivery_1.NotificationDelivery);
        this.prefRepo = data_source_1.AppDataSource.getRepository(UserAlertPreference_1.UserAlertPreference);
    }
    async getSummary() {
        const totalAlertsPromise = this.alertRepo.count();
        const deliveredCountPromise = this.deliveryRepo.count();
        const readCountPromise = this.prefRepo.count({ where: { isRead: true } });
        const snoozedCountPromise = this.prefRepo
            .createQueryBuilder('pref')
            .where('pref.snoozedUntil IS NOT NULL')
            .getCount();
        const severityRowsPromise = this.alertRepo
            .createQueryBuilder('alert')
            .select('alert.severity', 'severity')
            .addSelect('COUNT(alert.id)', 'total')
            .groupBy('alert.severity')
            .getRawMany();
        const snoozeRowsPromise = this.prefRepo
            .createQueryBuilder('pref')
            .select('pref.alertId', 'alertId')
            .addSelect('alert.title', 'title')
            .addSelect('COUNT(pref.id)', 'total')
            .leftJoin('pref.alert', 'alert')
            .where('pref.snoozedUntil IS NOT NULL')
            .groupBy('pref.alertId')
            .addGroupBy('alert.title')
            .getRawMany();
        const [totalAlerts, deliveredCount, readCount, snoozedCount, severityRows, snoozeRows] = await Promise.all([
            totalAlertsPromise,
            deliveredCountPromise,
            readCountPromise,
            snoozedCountPromise,
            severityRowsPromise,
            snoozeRowsPromise,
        ]);
        const severityBreakdown = {
            [Alert_1.AlertSeverity.INFO]: 0,
            [Alert_1.AlertSeverity.WARNING]: 0,
            [Alert_1.AlertSeverity.CRITICAL]: 0,
        };
        for (const row of severityRows) {
            const severity = row.severity;
            severityBreakdown[severity] = Number(row.total ?? 0);
        }
        const alertSnoozeBreakdown = snoozeRows.map((row) => ({
            alertId: row.alertId,
            title: row.title,
            snoozed: Number(row.total ?? 0),
        }));
        return {
            totalAlerts,
            deliveredCount,
            readCount,
            snoozedCount,
            severityBreakdown,
            alertSnoozeBreakdown,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
