import { Alert } from '../../entities/Alert';
import { User } from '../../entities/User';
import { DeliveryContext } from '../NotificationDispatcher';
import { NotificationDispatcher } from '../NotificationDispatcher';

export interface AlertObserver {
  handle(alert: Alert, user: User, context: DeliveryContext): Promise<void>;
}

export class NotificationObserver implements AlertObserver {
  constructor(private readonly dispatcher: NotificationDispatcher) {}

  async handle(alert: Alert, user: User, context: DeliveryContext): Promise<void> {
    await this.dispatcher.dispatch(alert, user, context);
  }
}

export class AlertObservable {
  private readonly observers: AlertObserver[] = [];

  constructor(initialObservers: AlertObserver[] = []) {
    this.observers.push(...initialObservers);
  }

  register(observer: AlertObserver): void {
    this.observers.push(observer);
  }

  async notify(alert: Alert, user: User, context: DeliveryContext): Promise<void> {
    for (const observer of this.observers) {
      await observer.handle(alert, user, context);
    }
  }
}
