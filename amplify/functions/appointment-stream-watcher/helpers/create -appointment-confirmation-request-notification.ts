import { v4 as generateUUIDv4 } from "uuid";
import { Appointment, AppointmentParticipantType, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  appointment: Appointment;
}

export const createAppointmentConfirmationRequestNotification = async ({ appointment, professional, patient, dbClient }: NotifierInput) => {
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

  const professionalPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PROFESSIONAL)
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
    templateKey: NotificationTemplateKey.APPOINTMENT_CONFIRMATION_REQUIRED,
    templateData: {
      recipientName: recipient.name,
      requesterName: requester.name,
      requesterType: requesterType,
      appointmentNumber: appointmentNumber,
      appointmentDateTime: appointmentDateTime,
      duration: Number(duration),
      appointmentType: appointmentType,
      purpose: purpose
    },
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: appointmentId,
    relatedItemType: NotificationRelatedItemType.APPOINTMENT,
    payload: {
      href: appointmentDeepLink
    },
    channels: channels,
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}