import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Alert, DeliveryType } from '../entities/Alert';
import { NotificationDelivery, DeliveryStatus } from '../entities/NotificationDelivery';
import { User } from '../entities/User';

export interface DeliveryContext {
  status: DeliveryStatus;
  reason: 'initial' | 'reminder' | 'read' | 'snooze';
}

export interface NotificationChannelStrategy {
  readonly type: DeliveryType;
  deliver(alert: Alert, user: User, context: DeliveryContext): Promise<void>;
}

class InAppNotificationStrategy implements NotificationChannelStrategy {
  readonly type = DeliveryType.IN_APP;

  constructor(private readonly deliveryRepo: Repository<NotificationDelivery>) {}

  async deliver(alert: Alert, user: User, context: DeliveryContext): Promise<void> {
    const delivery = this.deliveryRepo.create({
      alert,
      user,
      deliveryType: this.type,
      status: context.status,
    });
    await this.deliveryRepo.save(delivery);
  }
}

export class NotificationDispatcher {
  private readonly strategies = new Map<DeliveryType, NotificationChannelStrategy>();
  private readonly fallback: NotificationChannelStrategy;

  constructor(strategies?: NotificationChannelStrategy[]) {
    const deliveryRepo = AppDataSource.getRepository(NotificationDelivery);
    const registered = strategies ?? [new InAppNotificationStrategy(deliveryRepo)];
    if (!registered.length) {
      throw new Error('At least one notification strategy must be registered');
    }

    for (const strategy of registered) {
      this.strategies.set(strategy.type, strategy);
    }

    this.fallback = registered[0];
  }

  async dispatch(alert: Alert, user: User, context: DeliveryContext): Promise<void> {
    const strategy = this.strategies.get(alert.deliveryType) ?? this.fallback;
    await strategy.deliver(alert, user, context);
  }
}
