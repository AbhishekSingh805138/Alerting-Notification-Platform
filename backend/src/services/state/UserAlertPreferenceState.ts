import { DeliveryStatus } from '../../entities/NotificationDelivery';
import { UserAlertPreference } from '../../entities/UserAlertPreference';

export type PreferenceStateName = 'unread' | 'read' | 'snoozed';

export interface PreferenceStateChange {
  status: DeliveryStatus;
  reason: 'read' | 'snooze';
}

interface PreferenceState {
  readonly name: PreferenceStateName;
  setRead(machine: UserAlertPreferenceStateMachine, isRead: boolean, now: Date): PreferenceStateChange | null;
  snooze(machine: UserAlertPreferenceStateMachine, until: Date, now: Date): PreferenceStateChange | null;
}

class UnreadState implements PreferenceState {
  readonly name: PreferenceStateName = 'unread';

  setRead(machine: UserAlertPreferenceStateMachine, isRead: boolean, _now: Date): PreferenceStateChange | null {
    if (!isRead) {
      return null;
    }
    const pref = machine.preference;
    pref.isRead = true;
    pref.snoozedUntil = null;
    machine.transitionTo(new ReadState());
    return { status: DeliveryStatus.READ, reason: 'read' };
  }

  snooze(machine: UserAlertPreferenceStateMachine, until: Date, now: Date): PreferenceStateChange | null {
    const pref = machine.preference;
    pref.snoozedUntil = until;
    pref.lastReminderAt = now;
    pref.isRead = false;
    machine.transitionTo(new SnoozedState());
    return { status: DeliveryStatus.SNOOZED, reason: 'snooze' };
  }
}

class ReadState implements PreferenceState {
  readonly name: PreferenceStateName = 'read';

  setRead(machine: UserAlertPreferenceStateMachine, isRead: boolean, now: Date): PreferenceStateChange | null {
    const pref = machine.preference;
    if (isRead) {
      pref.snoozedUntil = null;
      return { status: DeliveryStatus.READ, reason: 'read' };
    }
    pref.isRead = false;
    pref.lastReminderAt = now;
    machine.transitionTo(new UnreadState());
    return null;
  }

  snooze(machine: UserAlertPreferenceStateMachine, until: Date, now: Date): PreferenceStateChange | null {
    const pref = machine.preference;
    pref.isRead = false;
    pref.snoozedUntil = until;
    pref.lastReminderAt = now;
    machine.transitionTo(new SnoozedState());
    return { status: DeliveryStatus.SNOOZED, reason: 'snooze' };
  }
}

class SnoozedState implements PreferenceState {
  readonly name: PreferenceStateName = 'snoozed';

  setRead(machine: UserAlertPreferenceStateMachine, isRead: boolean, now: Date): PreferenceStateChange | null {
    const pref = machine.preference;
    if (isRead) {
      pref.isRead = true;
      pref.snoozedUntil = null;
      pref.lastReminderAt = now;
      machine.transitionTo(new ReadState());
      return { status: DeliveryStatus.READ, reason: 'read' };
    }
    pref.isRead = false;
    machine.transitionTo(new UnreadState());
    return null;
  }

  snooze(machine: UserAlertPreferenceStateMachine, until: Date, now: Date): PreferenceStateChange | null {
    const pref = machine.preference;
    pref.snoozedUntil = until;
    pref.lastReminderAt = now;
    return { status: DeliveryStatus.SNOOZED, reason: 'snooze' };
  }
}

export class UserAlertPreferenceStateMachine {
  private state: PreferenceState;

  constructor(readonly preference: UserAlertPreference) {
    this.state = this.resolveState();
  }

  async setRead(isRead: boolean, now: Date): Promise<PreferenceStateChange | null> {
    const change = this.state.setRead(this, isRead, now);
    this.state = this.resolveState();
    return change;
  }

  async snooze(until: Date, now: Date): Promise<PreferenceStateChange | null> {
    const change = this.state.snooze(this, until, now);
    this.state = this.resolveState();
    return change;
  }

  transitionTo(state: PreferenceState): void {
    this.state = state;
  }

  private resolveState(): PreferenceState {
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
