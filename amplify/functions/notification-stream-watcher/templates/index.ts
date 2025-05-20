import { Notification, NotificationTemplateKey } from '../../helpers/types/schema';
import { generateAppointmentCancelledMessages } from './APPOINTMENT_CANCELLED';
import { generateAppointmentConfirmationRequiredMessages } from "./APPOINTMENT_CONFIRMATION_REQUIRED";
import { generateAppointmentConfirmedMessages } from './APPOINTMENT_CONFIRMED';
import { generateAppointmentJoinReadyMessages } from './APPOINTMENT_JOIN_READY';
import { generateAppointmentReminderMessages } from './APPOINTMENT_REMINDER';
import { generateAppointmentRescheduleRequiredMessages } from './APPOINTMENT_RESCHEDULE_REQUIRED';
import { generateContractStatusPatientUpdateMessages } from './CONTRACT_STATUS_PATIENT_UPDATE';
import { generateContractStatusProfessionalUpdateMessages } from './CONTRACT_STATUS_PROFESSIONAL_UPDATE';
import { generateDeliveryAssignmentAvailableMessages } from './DELIVERY_ASSIGNMENT_AVAILABLE';
import { generateDeliveryDriverAssignedMessages } from './DELIVERY_DRIVER_ASSIGNED';
import { generateDeliveryEventAdminAlertMessages } from './DELIVERY_EVENT_ADMIN_ALERT';
import { generateDeliveryStatusPatientUpdateMessages } from './DELIVERY_STATUS_PATIENT_UPDATE';
import { generateDeliveryTaskDriverUpdateMessages } from './DELIVERY_TASK_DRIVER_UPDATE';
import { generateInvoiceCreatedMessages } from './INVOICE_CREATED';
import { generateInvoiceStatusUpdatedMessages } from './INVOICE_STATUS_UPDATED';
import { generateMedicineOrderCreatedMessages } from './MEDICINE_ORDER_CREATED';
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

  if (notification.templateKey === NotificationTemplateKey.DELIVERY_ASSIGNMENT_AVAILABLE) {
    return generateDeliveryAssignmentAvailableMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.DELIVERY_DRIVER_ASSIGNED) {
    return generateDeliveryDriverAssignedMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.DELIVERY_STATUS_PATIENT_UPDATE) {
    return generateDeliveryStatusPatientUpdateMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.DELIVERY_TASK_DRIVER_UPDATE) {
    return generateDeliveryTaskDriverUpdateMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.DELIVERY_EVENT_ADMIN_ALERT) {
    return generateDeliveryEventAdminAlertMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.MEDICINE_ORDER_CREATED) {
    return generateMedicineOrderCreatedMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.INVOICE_CREATED) {
    return generateInvoiceCreatedMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.INVOICE_STATUS_UPDATED) {
    return generateInvoiceStatusUpdatedMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.CONTRACT_STATUS_PATIENT_UPDATE) {
    return generateContractStatusPatientUpdateMessages({ notification });
  }

  if (notification.templateKey === NotificationTemplateKey.CONTRACT_STATUS_PROFESSIONAL_UPDATE) {
    return generateContractStatusProfessionalUpdateMessages({ notification });
  }
};