"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const AlertService_1 = require("../services/AlertService");
const AnalyticsService_1 = require("../services/AnalyticsService");
const DirectoryService_1 = require("../services/DirectoryService");
class AdminController {
    constructor(alertService = new AlertService_1.AlertService(), analyticsService = new AnalyticsService_1.AnalyticsService(), directoryService = new DirectoryService_1.DirectoryService()) {
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.directoryService = directoryService;
        this.createAlert = async (req, res, next) => {
            try {
                const alert = await this.alertService.createAlert(req.body);
                res.status(201).json(alert);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateAlert = async (req, res, next) => {
            try {
                const alert = await this.alertService.updateAlert(req.params.id, req.body);
                res.json(alert);
            }
            catch (error) {
                next(error);
            }
        };
        this.listAlerts = async (req, res, next) => {
            try {
                const { severity, status, audience } = req.query;
                const alerts = await this.alertService.listAlerts({
                    severity: severity ? severity : undefined,
                    status: status ? status : undefined,
                    audience: audience ? audience : undefined,
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
            }
            catch (error) {
                next(error);
            }
        };
        this.listTeams = async (_req, res, next) => {
            try {
                const teams = await this.directoryService.listTeams();
                res.json(teams);
            }
            catch (error) {
                next(error);
            }
        };
        this.listUsers = async (_req, res, next) => {
            try {
                const users = await this.directoryService.listUsers();
                res.json(users);
            }
            catch (error) {
                next(error);
            }
        };
        this.triggerReminders = async (_req, res, next) => {
            try {
                const result = await this.alertService.triggerReminders();
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.analytics = async (_req, res, next) => {
            try {
                const summary = await this.analyticsService.getSummary();
                res.json(summary);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AdminController = AdminController;
