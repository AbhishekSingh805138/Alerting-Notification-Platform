import { In, Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Alert, AlertSeverity, DeliveryType } from '../entities/Alert';
import { DeliveryStatus } from '../entities/NotificationDelivery';
import { Team } from '../entities/Team';
import { User } from '../entities/User';
import { UserAlertPreference } from '../entities/UserAlertPreference';
import { CreateAlertDto, UpdateAlertDto, AlertFilterDto } from '../dtos/alert.dto';
import { startOfNextDay } from '../utils/date';
import { NotificationDispatcher } from './NotificationDispatcher';
import { AlertObservable, NotificationObserver } from './observers/AlertObservable';
import { UserAlertPreferenceStateMachine } from './state/UserAlertPreferenceState';

export interface UserAlertView {
  alert: Alert;
  preference: UserAlertPreference;
}

export class AlertService {
  private alertRepo: Repository<Alert>;

  private teamRepo: Repository<Team>;

  private userRepo: Repository<User>;

  private prefRepo: Repository<UserAlertPreference>;

  private dispatcher: NotificationDispatcher;

  private alertObservable: AlertObservable;

  constructor() {
    this.alertRepo = AppDataSource.getRepository(Alert);
    this.teamRepo = AppDataSource.getRepository(Team);
    this.userRepo = AppDataSource.getRepository(User);
    this.prefRepo = AppDataSource.getRepository(UserAlertPreference);
    this.dispatcher = new NotificationDispatcher();
    this.alertObservable = new AlertObservable([new NotificationObserver(this.dispatcher)]);
  }

  async createAlert(payload: CreateAlertDto): Promise<Alert> {
    if (!payload.title || !payload.message) {
      throw new Error('Title and message are required');
    }

    const alert = new Alert();
    alert.title = payload.title;
    alert.message = payload.message;
    alert.severity = payload.severity ?? AlertSeverity.INFO;
    alert.deliveryType = payload.deliveryType ?? DeliveryType.IN_APP;
    alert.reminderFrequencyMinutes = payload.reminderFrequencyMinutes ?? 120;
    alert.startAt = payload.startAt ? new Date(payload.startAt) : new Date();
    alert.endAt = payload.endAt ? new Date(payload.endAt) : null;
    alert.remindersEnabled = payload.remindersEnabled ?? true;
    alert.visibleToOrganization = payload.visibleToOrganization ?? false;
    alert.isArchived = false;

    const teams = payload.teamIds?.length ? await this.teamRepo.findBy({ id: In(payload.teamIds) }) : [];
    const users = payload.userIds?.length ? await this.userRepo.findBy({ id: In(payload.userIds) }) : [];

    alert.teams = teams;
    alert.users = users;

    const saved = await this.alertRepo.save(alert);

    const targetUsers = await this.computeTargetUsers(saved);
    await this.ensurePreferencesAndDeliveries(saved, targetUsers, true);

    return this.getAlertByIdOrFail(saved.id);
  }

  async updateAlert(alertId: string, payload: UpdateAlertDto): Promise<Alert> {
    const alert = await this.getAlertByIdOrFail(alertId);

    if (payload.title !== undefined) {
      alert.title = payload.title;
    }
    if (payload.message !== undefined) {
      alert.message = payload.message;
    }
    if (payload.severity !== undefined) {
      alert.severity = payload.severity;
    }
    if (payload.deliveryType !== undefined) {
      alert.deliveryType = payload.deliveryType;
    }
    if (payload.reminderFrequencyMinutes !== undefined) {
      alert.reminderFrequencyMinutes = payload.reminderFrequencyMinutes;
    }
    if (payload.startAt !== undefined) {
      alert.startAt = payload.startAt ? new Date(payload.startAt) : alert.startAt;
    }
    if (payload.endAt !== undefined) {
      alert.endAt = payload.endAt ? new Date(payload.endAt) : null;
    }
    if (payload.remindersEnabled !== undefined) {
      alert.remindersEnabled = payload.remindersEnabled;
    }
    if (payload.visibleToOrganization !== undefined) {
      alert.visibleToOrganization = payload.visibleToOrganization;
    }
    if (payload.isArchived !== undefined) {
      alert.isArchived = payload.isArchived;
    }

    if (payload.teamIds) {
      const teams = payload.teamIds.length ? await this.teamRepo.findBy({ id: In(payload.teamIds) }) : [];
      alert.teams = teams;
    }

    if (payload.userIds) {
      const users = payload.userIds.length ? await this.userRepo.findBy({ id: In(payload.userIds) }) : [];
      alert.users = users;
    }

    const saved = await this.alertRepo.save(alert);
    const targetUsers = await this.computeTargetUsers(saved);
    await this.ensurePreferencesAndDeliveries(saved, targetUsers, true);

    return this.getAlertByIdOrFail(saved.id);
  }

  async listAlerts(filter: AlertFilterDto = {}): Promise<Alert[]> {
    const query = this.alertRepo
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.teams', 'team')
      .leftJoinAndSelect('alert.users', 'user')
      .leftJoinAndSelect('alert.userPreferences', 'pref')
      .leftJoinAndSelect('pref.user', 'prefUser')
      .distinct(true);

    if (filter.severity) {
      query.andWhere('alert.severity = :severity', { severity: filter.severity });
    }

    if (filter.status) {
      const now = new Date();
      if (filter.status === 'active') {
        query.andWhere('alert.isArchived = false')
          .andWhere('alert.startAt <= :now', { now })
          .andWhere('(alert.endAt IS NULL OR alert.endAt > :now)', { now });
      }
      if (filter.status === 'expired') {
        query.andWhere('alert.endAt IS NOT NULL AND alert.endAt <= :now', { now })
          .andWhere('alert.isArchived = false');
      }
      if (filter.status === 'archived') {
        query.andWhere('alert.isArchived = true');
      }
    }

    if (filter.audience) {
      if (filter.audience === 'organization') {
        query.andWhere('alert.visibleToOrganization = true');
      }
      if (filter.audience === 'team') {
        query.andWhere('alert.visibleToOrganization = false')
          .andWhere('EXISTS (SELECT 1 FROM alert_teams at WHERE at.alert_id = alert.id)');
      }
      if (filter.audience === 'user') {
        query.andWhere('EXISTS (SELECT 1 FROM alert_users au WHERE au.alert_id = alert.id)');
      }
    }

    query.orderBy('alert.createdAt', 'DESC');

    return query.getMany();
  }

  async fetchUserAlerts(userId: string, options: { includeSnoozed?: boolean } = {}): Promise<UserAlertView[]> {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['team'] });
    if (!user) {
      throw new Error('User not found');
    }

    const includeSnoozed = options.includeSnoozed ?? false;
    const now = new Date();

    const alerts = await this.alertRepo
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.teams', 'team')
      .leftJoinAndSelect('alert.users', 'targetedUser')
      .leftJoinAndSelect('alert.userPreferences', 'pref')
      .leftJoinAndSelect('pref.user', 'prefUser')
      .where('alert.isArchived = false')
      .andWhere('alert.startAt <= :now', { now })
      .andWhere('(alert.endAt IS NULL OR alert.endAt > :now)', { now })
      .getMany();

    const relevant: UserAlertView[] = [];

    for (const alert of alerts) {
      const targetedUsers = await this.computeTargetUsers(alert, user);
      const isTargeted = targetedUsers.some((candidate) => candidate.id === user.id);
      if (!isTargeted) {
        continue;
      }

      const preference = alert.userPreferences?.find((pref) => pref.user.id === user.id);
      if (!preference) {
        continue;
      }

      const snoozedUntil = preference.snoozedUntil ? new Date(preference.snoozedUntil) : null;
      const snoozedActive = snoozedUntil ? snoozedUntil.getTime() > now.getTime() : false;
      if (!includeSnoozed && snoozedActive) {
        continue;
      }

      relevant.push({ alert, preference });
    }

    return relevant;
  }

  async markAlertRead(userId: string, alertId: string, isRead: boolean): Promise<UserAlertPreference> {
    const pref = await this.prefRepo.findOne({
      where: { alert: { id: alertId }, user: { id: userId } },
      relations: ['alert', 'user'],
    });
    if (!pref) {
      throw new Error('Preference not found for user/alert');
    }

    const stateMachine = new UserAlertPreferenceStateMachine(pref);
    const now = new Date();
    const change = await stateMachine.setRead(isRead, now);

    const saved = await this.prefRepo.save(pref);

    if (change) {
      await this.alertObservable.notify(pref.alert, pref.user, {
        status: change.status,
        reason: change.reason,
      });
    }

    return saved;
  }

  async snoozeAlert(userId: string, alertId: string): Promise<UserAlertPreference> {
    const pref = await this.prefRepo.findOne({
      where: { alert: { id: alertId }, user: { id: userId } },
      relations: ['alert', 'user'],
    });
    if (!pref) {
      throw new Error('Preference not found for user/alert');
    }

    const now = new Date();
    const stateMachine = new UserAlertPreferenceStateMachine(pref);
    const snoozeUntil = startOfNextDay(now);
    const change = await stateMachine.snooze(snoozeUntil, now);

    const saved = await this.prefRepo.save(pref);

    if (change) {
      await this.alertObservable.notify(pref.alert, pref.user, {
        status: change.status,
        reason: change.reason,
      });
    }

    return saved;
  }


  async triggerReminders(): Promise<{ processed: number; deliveries: number }> {
    const now = new Date();

    const prefs = await this.prefRepo
      .createQueryBuilder('pref')
      .leftJoinAndSelect('pref.alert', 'alert')
      .leftJoinAndSelect('alert.teams', 'alertTeam')
      .leftJoinAndSelect('alert.users', 'alertUser')
      .leftJoinAndSelect('pref.user', 'user')
      .where('alert.isArchived = false')
      .andWhere('alert.remindersEnabled = true')
      .getMany();

    const due: UserAlertPreference[] = [];

    for (const pref of prefs) {
      if (!pref.alert || !pref.user) {
        continue;
      }

      const alertActive = pref.alert.startAt <= now && (!pref.alert.endAt || pref.alert.endAt > now);
      if (!alertActive) {
        continue;
      }

      if (pref.isRead) {
        continue;
      }

      if (pref.snoozedUntil && pref.snoozedUntil > now) {
        continue;
      }

      const stillTargeted = (await this.computeTargetUsers(pref.alert, pref.user)).length > 0;
      if (!stillTargeted) {
        continue;
      }

      const frequency = pref.alert.reminderFrequencyMinutes ?? 120;
      if (pref.lastReminderAt) {
        const diffMinutes = (now.getTime() - pref.lastReminderAt.getTime()) / (1000 * 60);
        if (diffMinutes < frequency) {
          continue;
        }
      }

      due.push(pref);
    }

    let deliveries = 0;
    for (const pref of due) {
      pref.lastReminderAt = now;
      pref.lastDeliveredAt = now;
      await this.prefRepo.save(pref);
      await this.alertObservable.notify(pref.alert, pref.user, {
        status: DeliveryStatus.DELIVERED,
        reason: 'reminder',
      });
      deliveries += 1;
    }

    return { processed: due.length, deliveries };
  }

  async getAlertByIdOrFail(id: string): Promise<Alert> {
    const alert = await this.alertRepo.findOne({
      where: { id },
      relations: ['teams', 'users', 'userPreferences', 'userPreferences.user'],
    });
    if (!alert) {
      throw new Error('Alert not found');
    }
    return alert;
  }

  private async computeTargetUsers(alert: Alert, specificUser?: User): Promise<User[]> {
    const usersMap = new Map<string, User>();

    const explicitUsers = alert.users && alert.users.length
      ? alert.users
      : await this.userRepo
          .createQueryBuilder('user')
          .innerJoin('user.targetedAlerts', 'alert', 'alert.id = :id', { id: alert.id })
          .getMany();
    explicitUsers.forEach((user) => usersMap.set(user.id, user));

    const teamIds = alert.teams?.map((team) => team.id) ?? [];
    if (teamIds.length) {
      const teamUsers = await this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.team', 'team')
        .where('team.id IN (:...teamIds)', { teamIds })
        .getMany();
      teamUsers.forEach((user) => usersMap.set(user.id, user));
    }

    if (alert.visibleToOrganization) {
      const orgUsers = specificUser
        ? [specificUser]
        : await this.userRepo.find();
      orgUsers.forEach((user) => usersMap.set(user.id, user));
    }

    if (specificUser) {
      const candidate = usersMap.get(specificUser.id);
      return candidate ? [specificUser] : [];
    }

    return Array.from(usersMap.values());
  }

  private async ensurePreferencesAndDeliveries(alert: Alert, users: User[], deliver: boolean): Promise<void> {
    if (!users.length) {
      return;
    }

    const userIds = users.map((user) => user.id);

    const existing = await this.prefRepo.find({
      where: { alert: { id: alert.id }, user: { id: In(userIds) } },
      relations: ['user', 'alert'],
    });

    const existingMap = new Map(existing.map((pref) => [pref.user.id, pref] as const));
    const newPreferences: UserAlertPreference[] = [];
    const deliveredAt = deliver ? new Date() : null;

    for (const user of users) {
      if (existingMap.has(user.id)) {
        continue;
      }
      const pref = new UserAlertPreference();
      pref.alert = alert;
      pref.user = user;
      pref.isRead = false;
      pref.snoozedUntil = null;
      pref.lastReminderAt = deliveredAt;
      pref.lastDeliveredAt = deliveredAt;
      newPreferences.push(pref);
    }

    const savedNewPreferences = newPreferences.length ? await this.prefRepo.save(newPreferences) : [];

    if (deliver && savedNewPreferences.length) {
      for (const pref of savedNewPreferences) {
        await this.alertObservable.notify(alert, pref.user, {
          status: DeliveryStatus.DELIVERED,
          reason: 'initial',
        });
      }
    }
  }
}

