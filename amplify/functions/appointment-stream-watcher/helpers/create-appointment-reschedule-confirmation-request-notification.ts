import { v4 as generateUUIDv4 } from "uuid";
import { Appointment, AppointmentParticipantType, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  appointment: Appointment;
  originalAppointmentDateTime: string;
}

export const createAppointmentRescheduleConfirmationRequestNotification = async ({ appointment, professional, patient, dbClient, originalAppointmentDateTime }: NotifierInput) => {
  const { id: appointmentId, appointmentNumber, appointmentDateTime, duration, type: appointmentType, purpose, requesterType } = appointment;

  const patientDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
  const professionalDeepLink = `curati://life.curati.rx/(app)/profile/appointments/${appointmentId}`;
  const appointmentDeepLink = requesterType === AppointmentParticipantType.PATIENT ? patientDeepLink : professionalDeepLink;

  const requester = requesterType === AppointmentParticipantType.PATIENT ? patient : professional;
  const recipient = requesterType === AppointmentParticipantType.PATIENT ? professional : patient;

  const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: recipient.userId });

  if (recipientUserErrors || !recipientUserData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
  }
  const recipientUser = recipientUserData as unknown as User;

  const professionalPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === requesterType)
  const pushTokens = professionalPushTokens.map(token => token?.split(' ')[0]) as string[];

  const channels: NotificationChannel[] = [
    {
      type: NotificationChannelType.SMS,
      targets: [`+258${recipient.phone.replace(/\D/g, '')}`],
    },
    {
      type: NotificationChannelType.PUSH,
      targets: pushTokens,
    },
    {
      type: NotificationChannelType.IN_APP,
      targets: [],
    }
  ];

  if (recipient.email) channels.push({
    type: NotificationChannelType.EMAIL,
    targets: [recipient.email],
  })

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: recipient.userId,
    templateKey: NotificationTemplateKey.APPOINTMENT_RESCHEDULE_REQUIRED,
    templateData: JSON.stringify({
      recipientName: recipient.name,
      reschedulerName: requester.name,
      reschedulerType: requesterType,
      appointmentNumber: appointmentNumber,
      originalAppointmentDateTime: originalAppointmentDateTime,
      newAppointmentDateTime: appointmentDateTime,
      duration: Number(duration),
      appointmentType: appointmentType,
      purpose: purpose
    }),
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: appointmentId,
    relatedItemType: NotificationRelatedItemType.APPOINTMENT,
    payload: {
      href: appointmentDeepLink
    },
    channels: JSON.stringify(channels),
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}