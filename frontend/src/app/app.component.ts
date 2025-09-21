import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AlertingApiService } from './services/alerting-api.service';
import { UserSummary } from './models/alert.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, UserDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  view: 'admin' | 'user' = 'admin';

  users: UserSummary[] = [];

  loadingUsers = false;

  error: string | null = null;

  selectedUserId: string | null = null;

  constructor(private readonly api: AlertingApiService) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loadingUsers = true;
    try {
      this.users = await firstValueFrom(this.api.getUsers());
      if (this.users.length && !this.selectedUserId) {
        this.selectedUserId = this.users[0].id;
      }
    } catch (error) {
      this.error = this.extractErrorMessage(error);
    } finally {
      this.loadingUsers = false;
    }
  }

  selectView(view: 'admin' | 'user'): void {
    this.view = view;
  }

  selectUser(userId: string): void {
    this.selectedUserId = userId || null;
  }

  onUserChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const value = target?.value ?? '';
    this.selectUser(value);
  }

  get selectedUserName(): string | null {
    if (!this.selectedUserId) {
      return null;
    }
    return this.users.find((user) => user.id === this.selectedUserId)?.name ?? null;
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
