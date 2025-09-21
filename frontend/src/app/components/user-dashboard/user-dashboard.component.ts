import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertingApiService } from '../../services/alerting-api.service';
import { UserAlertItem } from '../../models/alert.models';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnChanges {
  @Input() userId: string | null = null;

  @Input() userName: string | null = null;

  alerts: UserAlertItem[] = [];

  includeSnoozed = false;

  loading = false;

  error: string | null = null;

  constructor(private readonly api: AlertingApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('userId' in changes) {
      void this.loadAlerts();
    }
  }

  async loadAlerts(): Promise<void> {
    if (!this.userId) {
      this.alerts = [];
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      this.alerts = await firstValueFrom(this.api.getUserAlerts(this.userId, this.includeSnoozed));
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async toggleRead(alert: UserAlertItem): Promise<void> {
    if (!this.userId) {
      return;
    }
    try {
      await firstValueFrom(this.api.setReadState(this.userId, alert.id, !alert.isRead));
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  async snooze(alert: UserAlertItem): Promise<void> {
    if (!this.userId) {
      return;
    }
    try {
      await firstValueFrom(this.api.snoozeAlert(this.userId, alert.id));
      await this.loadAlerts();
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    }
  }

  async refresh(): Promise<void> {
    await this.loadAlerts();
  }

  trackById(_: number, alert: UserAlertItem): string {
    return alert.id;
  }

  toggleIncludeSnoozed(checked: boolean): void {
    this.includeSnoozed = checked;
    void this.loadAlerts();
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
