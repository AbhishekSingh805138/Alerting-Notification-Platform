export type AlertSeverity = 'info' | 'warning' | 'critical';
export type DeliveryType = 'in_app' | 'email' | 'sms';

export interface TeamSummary {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  name: string;
  teamId: string | null;
}

export interface AdminAlertStats {
  totalRecipients: number;
  readCount: number;
  snoozedCount: number;
  activeReminders: boolean;
}

export interface AdminAlertItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  deliveryType: DeliveryType;
  reminderFrequencyMinutes: number;
  startAt: string;
  endAt: string | null;
  remindersEnabled: boolean;
  isArchived: boolean;
  visibleToOrganization: boolean;
  teams: TeamSummary[];
  directUsers: Array<Pick<UserSummary, 'id' | 'name'>>;
  stats: AdminAlertStats;
}

export interface CreateAlertRequest {
  title: string;
  message: string;
  severity: AlertSeverity;
  deliveryType?: DeliveryType;
  reminderFrequencyMinutes?: number;
  startAt?: string | null;
  endAt?: string | null;
  remindersEnabled?: boolean;
  visibleToOrganization?: boolean;
  teamIds?: string[];
  userIds?: string[];
}

export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
  isArchived?: boolean;
}

export interface AdminAlertFilter {
  severity?: AlertSeverity;
  status?: 'active' | 'expired' | 'archived';
  audience?: 'organization' | 'team' | 'user';
}

export interface UserAlertItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  deliveryType: DeliveryType;
  reminderFrequencyMinutes: number;
  startAt: string;
  endAt: string | null;
  remindersEnabled: boolean;
  isRead: boolean;
  isSnoozed: boolean;
  snoozedUntil: string | null;
  lastReminderAt: string | null;
}

export interface AnalyticsSummary {
  totalAlerts: number;
  deliveredCount: number;
  readCount: number;
  snoozedCount: number;
  severityBreakdown: Record<AlertSeverity, number>;
  alertSnoozeBreakdown: Array<{ alertId: string; title: string; snoozed: number }>;
}
