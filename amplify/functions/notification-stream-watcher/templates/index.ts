import { Notification, NotificationTemplateKey } from '../../helpers/types/schema';
import { generateAppointmentCancelledMessages } from './APPOINTMENT_CANCELLED';
import { generateAppointmentConfirmationRequiredMessages } from "./APPOINTMENT_CONFIRMATION_REQUIRED";
import { generateAppointmentConfirmedMessages } from './APPOINTMENT_CONFIRMED';
import { generateAppointmentJoinReadyMessages } from './APPOINTMENT_JOIN_READY';
import { generateAppointmentReminderMessages } from './APPOINTMENT_REMINDER';
import { generateAppointmentRescheduleRequiredMessages } from './APPOINTMENT_RESCHEDULE_REQUIRED';
import { generatePrescriptionStatusUpdatedMessages } from './PRESCRIPTION_STATUS_UPDATED';
import { generatePrescriptionValidationRequiredMessages } from './PRESCRIPTION_VALIDATION_REQUIRED';

interface TemplateInput {
  notification: Notification
}

export const generateMessages = ({ notification }: TemplateInput) => {
  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_CONFIRMATION_REQUIRED) {
    return generateAppointmentConfirmationRequiredMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_CONFIRMED) {
    return generateAppointmentConfirmedMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_RESCHEDULE_REQUIRED) {
    return generateAppointmentRescheduleRequiredMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_CANCELLED) {
    return generateAppointmentCancelledMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_REMINDER) {
    return generateAppointmentReminderMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.APPOINTMENT_JOIN_READY) {
    return generateAppointmentJoinReadyMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.PRESCRIPTION_VALIDATION_REQUIRED) {
    return generatePrescriptionValidationRequiredMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.PRESCRIPTION_STATUS_UPDATED) {
    return generatePrescriptionStatusUpdatedMessages({ notification });
  }
};