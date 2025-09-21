import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdminAlertFilter,
  AdminAlertItem,
  AnalyticsSummary,
  CreateAlertRequest,
  TeamSummary,
  UpdateAlertRequest,
  UserAlertItem,
  UserSummary,
} from '../models/alert.models';

@Injectable({ providedIn: 'root' })
export class AlertingApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;

  getAdminAlerts(filter?: AdminAlertFilter): Observable<AdminAlertItem[]> {
    let params = new HttpParams();
    if (filter?.severity) {
      params = params.set('severity', filter.severity);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.audience) {
      params = params.set('audience', filter.audience);
    }
    return this.http.get<AdminAlertItem[]>(`${this.baseUrl}/admin/alerts`, { params });
  }

  createAlert(payload: CreateAlertRequest): Observable<AdminAlertItem> {
    return this.http.post<AdminAlertItem>(`${this.baseUrl}/admin/alerts`, payload);
  }

  updateAlert(id: string, payload: UpdateAlertRequest): Observable<AdminAlertItem> {
    return this.http.put<AdminAlertItem>(`${this.baseUrl}/admin/alerts/${id}`, payload);
  }

  triggerReminders(): Observable<{ processed: number; deliveries: number }> {
    return this.http.post<{ processed: number; deliveries: number }>(`${this.baseUrl}/admin/reminders/trigger`, {});
  }

  getAnalytics(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.baseUrl}/admin/analytics`);
  }

  getTeams(): Observable<TeamSummary[]> {
    return this.http.get<TeamSummary[]>(`${this.baseUrl}/admin/teams`);
  }

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.baseUrl}/admin/users`);
  }

  getUserAlerts(userId: string, includeSnoozed = false): Observable<UserAlertItem[]> {
    const params = includeSnoozed ? new HttpParams().set('includeSnoozed', 'true') : undefined;
    return this.http.get<UserAlertItem[]>(`${this.baseUrl}/users/${userId}/alerts`, { params });
  }

  setReadState(userId: string, alertId: string, isRead: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/users/${userId}/alerts/${alertId}/read-state`, { isRead });
  }

  snoozeAlert(userId: string, alertId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/${userId}/alerts/${alertId}/snooze`, {});
  }
}
