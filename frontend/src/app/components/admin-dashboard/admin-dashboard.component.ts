import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AlertingApiService } from '../../services/alerting-api.service';
import {
  AdminAlertFilter,
  AdminAlertItem,
  AnalyticsSummary,
  CreateAlertRequest,
  TeamSummary,
  UpdateAlertRequest,
  UserSummary,
} from '../../models/alert.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  alerts: AdminAlertItem[] = [];
  teams: TeamSummary[] = [];
  users: UserSummary[] = [];
  analytics: AnalyticsSummary | null = null;

  loading = false;
  creating = false;
  error: string | null = null;
  editingAlert: AdminAlertItem | null = null;

  readonly selectedTeamIds = new Set<string>();
  readonly selectedUserIds = new Set<string>();

  readonly severities = [
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'critical', label: 'Critical' },
  ];

  readonly deliveryTypes = [
    { value: 'in_app', label: 'In-App' },
    { value: 'email', label: 'Email (coming soon)', disabled: true },
    { value: 'sms', label: 'SMS (coming soon)', disabled: true },
  ];

  readonly statuses = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'archived', label: 'Archived' },
  ];

  readonly audiences = [
    { value: 'organization', label: 'Organization' },
    { value: 'team', label: 'Teams' },
    { value: 'user', label: 'Users' },
  ];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(1500)]],
    severity: ['info', Validators.required],
    deliveryType: ['in_app', Validators.required],
    reminderFrequencyMinutes: [120, [Validators.min(15)]],
    visibleToOrganization: [true],
    remindersEnabled: [true],
    startAt: [''],
    endAt: [''],
  });

  readonly filtersForm = this.fb.group({
    severity: [''],
    status: [''],
    audience: [''],
  });

  constructor(private readonly fb: FormBuilder, private readonly api: AlertingApiService) {}

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();
  }

  get isEditing(): boolean {
    return this.editingAlert !== null;
  }

  get submitLabel(): string {
    return this.isEditing ? 'Update Alert' : 'Create Alert';
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const filter = this.currentFilter();
      const [alerts, teams, users, analytics] = await Promise.all([
        firstValueFrom(this.api.getAdminAlerts(filter)),
        firstValueFrom(this.api.getTeams()),
        firstValueFrom(this.api.getUsers()),
        firstValueFrom(this.api.getAnalytics()),
      ]);
      this.alerts = alerts;
      this.teams = teams;
      this.users = users;
      this.analytics = analytics;
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async loadAlerts(): Promise<void> {
    try {
      const filter = this.currentFilter();
      const [alerts, analytics] = await Promise.all([
        firstValueFrom(this.api.getAdminAlerts(filter)),
        firstValueFrom(this.api.getAnalytics()),
      ]);
      this.alerts = alerts;
      this.analytics = analytics;
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  applyFilters(): void {
    void this.loadAlerts();
  }

  clearFilters(): void {
    this.filtersForm.reset({ severity: '', status: '', audience: '' });
    void this.loadAlerts();
  }

  toggleTeam(teamId: string, checked: boolean): void {
    if (checked) {
      this.selectedTeamIds.add(teamId);
    } else {
      this.selectedTeamIds.delete(teamId);
    }
  }

  toggleUser(userId: string, checked: boolean): void {
    if (checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const createPayload: CreateAlertRequest = {
      title: formValue.title?.trim() ?? '',
      message: formValue.message?.trim() ?? '',
      severity: (formValue.severity ?? 'info') as 'info' | 'warning' | 'critical',
      deliveryType: (formValue.deliveryType ?? 'in_app') as 'in_app' | 'email' | 'sms',
      reminderFrequencyMinutes: Number(formValue.reminderFrequencyMinutes) || 120,
      remindersEnabled: Boolean(formValue.remindersEnabled),
      visibleToOrganization: Boolean(formValue.visibleToOrganization),
      teamIds: Array.from(this.selectedTeamIds),
      userIds: Array.from(this.selectedUserIds),
    };

    const startAtValue = formValue.startAt ? String(formValue.startAt).trim() : '';
    const endAtValue = formValue.endAt ? String(formValue.endAt).trim() : '';

    if (startAtValue) {
      createPayload.startAt = startAtValue;
    }

    if (endAtValue) {
      createPayload.endAt = endAtValue;
    }

    this.creating = true;
    try {
      if (this.isEditing && this.editingAlert) {
        const updatePayload: UpdateAlertRequest = { ...createPayload };
        if (!endAtValue && this.editingAlert.endAt) {
          updatePayload.endAt = null;
        }
        await firstValueFrom(this.api.updateAlert(this.editingAlert.id, updatePayload));
        this.cancelEdit();
      } else {
        await firstValueFrom(this.api.createAlert(createPayload));
        this.resetForm();
      }
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    } finally {
      this.creating = false;
    }
  }

  editAlert(alert: AdminAlertItem): void {
    this.editingAlert = alert;
    this.form.patchValue({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      deliveryType: alert.deliveryType,
      reminderFrequencyMinutes: alert.reminderFrequencyMinutes,
      visibleToOrganization: alert.visibleToOrganization,
      remindersEnabled: alert.remindersEnabled,
      startAt: this.toDateTimeLocal(alert.startAt),
      endAt: alert.endAt ? this.toDateTimeLocal(alert.endAt) : '',
    });

    this.selectedTeamIds.clear();
    alert.teams.forEach((team) => this.selectedTeamIds.add(team.id));

    this.selectedUserIds.clear();
    alert.directUsers.forEach((user) => this.selectedUserIds.add(user.id));
  }

  cancelEdit(): void {
    this.editingAlert = null;
    this.resetForm();
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      message: '',
      severity: 'info',
      deliveryType: 'in_app',
      reminderFrequencyMinutes: 120,
      visibleToOrganization: true,
      remindersEnabled: true,
      startAt: '',
      endAt: '',
    });
    this.selectedTeamIds.clear();
    this.selectedUserIds.clear();
  }

  async archiveAlert(alert: AdminAlertItem): Promise<void> {
    try {
      await firstValueFrom(this.api.updateAlert(alert.id, { isArchived: !alert.isArchived }));
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  async toggleReminders(alert: AdminAlertItem): Promise<void> {
    try {
      await firstValueFrom(this.api.updateAlert(alert.id, { remindersEnabled: !alert.remindersEnabled }));
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  async refreshAlerts(): Promise<void> {
    await this.loadAlerts();
  }

  async triggerReminders(): Promise<void> {
    try {
      await firstValueFrom(this.api.triggerReminders());
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  teamName(teamId: string | null): string {
    if (!teamId) {
      return 'No Team';
    }
    return this.teams.find((team) => team.id === teamId)?.name ?? 'Unknown';
  }

  trackByAlertId(_: number, alert: AdminAlertItem): string {
    return alert.id;
  }

  private currentFilter(): AdminAlertFilter {
    const value = this.filtersForm.value;
    const filter: AdminAlertFilter = {};
    if (value.severity) {
      filter.severity = value.severity as 'info' | 'warning' | 'critical';
    }
    if (value.status) {
      filter.status = value.status as 'active' | 'expired' | 'archived';
    }
    if (value.audience) {
      filter.audience = value.audience as 'organization' | 'team' | 'user';
    }
    return filter;
  }

  private toDateTimeLocal(value: string | Date | null): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private extractErrorMessage(error: unknown): string {
    if (!error) {
      return 'Unknown error';
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && 'error' in error && (error as any).error?.message) {
      return (error as any).error.message;
    }
    return 'Something went wrong';
  }
}

