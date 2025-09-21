"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const Alert_1 = require("./entities/Alert");
const Team_1 = require("./entities/Team");
const User_1 = require("./entities/User");
const AlertService_1 = require("./services/AlertService");
const teamsSeed = [
    { name: 'Engineering', members: ['Alice Johnson', 'Bob Smith', 'Charlie Evans'] },
    { name: 'Marketing', members: ['Diana Prince', 'Ethan Hawke'] },
    { name: 'Operations', members: ['Fiona Gallagher'] },
];
const run = async () => {
    console.log('Initializing database connection (seed)...');
    await data_source_1.AppDataSource.initialize();
    console.log('Database connection initialized (seed).');
    const teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const teams = new Map();
    for (const entry of teamsSeed) {
        let team = await teamRepo.findOne({ where: { name: entry.name } });
        if (!team) {
            team = teamRepo.create({ name: entry.name });
            team = await teamRepo.save(team);
        }
        teams.set(entry.name, team);
        for (const memberName of entry.members) {
            let user = await userRepo.findOne({ where: { name: memberName }, relations: ['team'] });
            if (!user) {
                user = userRepo.create({ name: memberName, team });
                await userRepo.save(user);
            }
            else if (!user.team || user.team.id !== team.id) {
                user.team = team;
                await userRepo.save(user);
            }
        }
    }
    const alertService = new AlertService_1.AlertService();
    const existingAlerts = await alertService.listAlerts();
    const needsWelcome = !existingAlerts.some((alert) => alert.title === 'Welcome to the Alerting Platform');
    if (needsWelcome) {
        await alertService.createAlert({
            title: 'Welcome to the Alerting Platform',
            message: 'This is a sample organization-wide alert. Snooze or mark as read after reviewing.',
            severity: Alert_1.AlertSeverity.INFO,
            visibleToOrganization: true,
        });
    }
    const engineeringTeam = teams.get('Engineering');
    if (engineeringTeam) {
        const teamAlertExists = existingAlerts.some((alert) => alert.title === 'Deploy Freeze Reminder');
        if (!teamAlertExists) {
            await alertService.createAlert({
                title: 'Deploy Freeze Reminder',
                message: 'Engineering deploy freeze starts tonight at 10pm UTC. Wrap up your changes.',
                severity: Alert_1.AlertSeverity.WARNING,
                teamIds: [engineeringTeam.id],
            });
        }
    }
    console.log('Seed data applied successfully.');
    console.log('Closing database connection (seed)...');
    await data_source_1.AppDataSource.destroy();
    console.log('Database connection closed (seed).');
};
run().catch((error) => {
    console.error('Failed to seed database', error);
    void data_source_1.AppDataSource.destroy();
    process.exit(1);
});
