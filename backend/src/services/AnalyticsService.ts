import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Alert, AlertSeverity } from '../entities/Alert';
import { NotificationDelivery } from '../entities/NotificationDelivery';
import { UserAlertPreference } from '../entities/UserAlertPreference';

export interface AnalyticsSummary {
  totalAlerts: number;
  deliveredCount: number;
  readCount: number;
  snoozedCount: number;
  severityBreakdown: Record<AlertSeverity, number>;
  alertSnoozeBreakdown: Array<{ alertId: string; title: string; snoozed: number }>;
}

export class AnalyticsService {
  private alertRepo: Repository<Alert> = AppDataSource.getRepository(Alert);

  private deliveryRepo: Repository<NotificationDelivery> = AppDataSource.getRepository(NotificationDelivery);

  private prefRepo: Repository<UserAlertPreference> = AppDataSource.getRepository(UserAlertPreference);

  async getSummary(): Promise<AnalyticsSummary> {
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

    const severityBreakdown: Record<AlertSeverity, number> = {
      [AlertSeverity.INFO]: 0,
      [AlertSeverity.WARNING]: 0,
      [AlertSeverity.CRITICAL]: 0,
    };
    for (const row of severityRows) {
      const severity = row.severity as AlertSeverity;
      severityBreakdown[severity] = Number(row.total ?? 0);
    }

    const alertSnoozeBreakdown = snoozeRows.map((row) => ({
      alertId: row.alertId as string,
      title: row.title as string,
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
