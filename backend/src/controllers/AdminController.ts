import { Request, Response, NextFunction } from 'express';
import { AlertSeverity } from '../entities/Alert';
import { AlertService } from '../services/AlertService';
import { AnalyticsService } from '../services/AnalyticsService';
import { DirectoryService } from '../services/DirectoryService';

export class AdminController {
  constructor(
    private readonly alertService = new AlertService(),
    private readonly analyticsService = new AnalyticsService(),
    private readonly directoryService = new DirectoryService(),
  ) {}

  createAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.alertService.createAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  };

  updateAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.alertService.updateAlert(req.params.id, req.body);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  };

  listAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { severity, status, audience } = req.query;
      const alerts = await this.alertService.listAlerts({
        severity: severity ? (severity as AlertSeverity) : undefined,
        status: status ? (status as 'active' | 'expired' | 'archived') : undefined,
        audience: audience ? (audience as 'organization' | 'team' | 'user') : undefined,
      });

      const now = new Date();
      const formatted = alerts.map((alert) => {
        const preferences = alert.userPreferences ?? [];
        const totalRecipients = preferences.length;
        const readCount = preferences.filter((pref) => pref.isRead).length;
        const snoozedActive = preferences.filter((pref) => pref.snoozedUntil && pref.snoozedUntil > now).length;
        const activeReminders = alert.remindersEnabled && !alert.isArchived;

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
          isArchived: alert.isArchived,
          visibleToOrganization: alert.visibleToOrganization,
          teams: alert.teams?.map((team) => ({ id: team.id, name: team.name })) ?? [],
          directUsers: alert.users?.map((user) => ({ id: user.id, name: user.name })) ?? [],
          stats: {
            totalRecipients,
            readCount,
            snoozedCount: snoozedActive,
            activeReminders,
          },
        };
      });

      res.json(formatted);
    } catch (error) {
      next(error);
    }
  };

  listTeams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teams = await this.directoryService.listTeams();
      res.json(teams);
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.directoryService.listUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  triggerReminders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.alertService.triggerReminders();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  analytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.analyticsService.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };
}



