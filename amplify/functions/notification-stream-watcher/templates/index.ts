import { Notification, NotificationTemplateKey } from '../../helpers/types/schema';
import { Message } from '../helpers/types';
import * as generator from './generator';

interface TemplateInput {
  notification: Notification
}

const templateMap: Record<NotificationTemplateKey, (input: TemplateInput) => Promise<Message>> = {
  [NotificationTemplateKey.APPOINTMENT_CONFIRMATION_REQUIRED]: generator.generateAppointmentConfirmationRequiredMessages,
  [NotificationTemplateKey.APPOINTMENT_CONFIRMED]: generator.generateAppointmentConfirmedMessages,
  [NotificationTemplateKey.APPOINTMENT_RESCHEDULE_REQUIRED]: generator.generateAppointmentRescheduleRequiredMessages,
  [NotificationTemplateKey.APPOINTMENT_CANCELLED]: generator.generateAppointmentCancelledMessages,
  [NotificationTemplateKey.APPOINTMENT_REMINDER]: generator.generateAppointmentReminderMessages,
  [NotificationTemplateKey.APPOINTMENT_JOIN_READY]: generator.generateAppointmentJoinReadyMessages,
  [NotificationTemplateKey.PRESCRIPTION_VALIDATION_REQUIRED]: generator.generatePrescriptionValidationRequiredMessages,
  [NotificationTemplateKey.PRESCRIPTION_STATUS_UPDATED]: generator.generatePrescriptionStatusUpdatedMessages,
  [NotificationTemplateKey.DELIVERY_ASSIGNMENT_AVAILABLE]: generator.generateDeliveryAssignmentAvailableMessages,
  [NotificationTemplateKey.DELIVERY_DRIVER_ASSIGNED]: generator.generateDeliveryDriverAssignedMessages,
  [NotificationTemplateKey.DELIVERY_STATUS_PATIENT_UPDATE]: generator.generateDeliveryStatusPatientUpdateMessages,
  [NotificationTemplateKey.DELIVERY_TASK_DRIVER_UPDATE]: generator.generateDeliveryTaskDriverUpdateMessages,
  [NotificationTemplateKey.DELIVERY_EVENT_ADMIN_ALERT]: generator.generateDeliveryEventAdminAlertMessages,
  [NotificationTemplateKey.MEDICINE_ORDER_CREATED]: generator.generateMedicineOrderCreatedMessages,
  [NotificationTemplateKey.INVOICE_CREATED]: generator.generateInvoiceCreatedMessages,
  [NotificationTemplateKey.INVOICE_STATUS_UPDATED]: generator.generateInvoiceStatusUpdatedMessages,
  [NotificationTemplateKey.CONTRACT_STATUS_PATIENT_UPDATE]: generator.generateContractStatusPatientUpdateMessages,
  [NotificationTemplateKey.CONTRACT_STATUS_PROFESSIONAL_UPDATE]: generator.generateContractStatusProfessionalUpdateMessages,
};

export const generateMessages = ({ notification }: TemplateInput) => {
  const generator = templateMap[notification.templateKey as NotificationTemplateKey];

  if (!generator) {
    throw new Error(`No template generator found for key: ${notification.templateKey}`);
  }

  return generator({ notification });
};