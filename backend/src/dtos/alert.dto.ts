import { AlertSeverity, DeliveryType } from '../entities/Alert';

export interface AlertAudienceDto {
  visibleToOrganization?: boolean;
  teamIds?: string[];
  userIds?: string[];
}

export interface CreateAlertDto extends AlertAudienceDto {
  title: string;
  message: string;
  severity?: AlertSeverity;
  deliveryType?: DeliveryType;
  reminderFrequencyMinutes?: number;
  startAt?: string | Date;
  endAt?: string | Date | null;
  remindersEnabled?: boolean;
}

export interface UpdateAlertDto extends Partial<CreateAlertDto> {
  isArchived?: boolean;
}

export interface AlertFilterDto {
  severity?: AlertSeverity;
  status?: 'active' | 'expired' | 'archived';
  audience?: 'organization' | 'team' | 'user';
}
