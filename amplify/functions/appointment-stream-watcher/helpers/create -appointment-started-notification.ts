import { v4 as generateUUIDv4 } from "uuid";
import { Appointment, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  appointment: Appointment;
}

export const createAppointmentStartedNotification = async ({ appointment, professional, patient, dbClient }: NotifierInput) => {
  const { id: appointmentId, appointmentDateTime, type: appointmentType } = appointment;

  const patientDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;

  const { data: userData, errors: userErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (userErrors || !userData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(userErrors)}`);
  }
  const user = userData as unknown as User;

  const professionalPushTokens = user.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PATIENT)
  const pushTokens = professionalPushTokens.map(token => token?.split(' ')[0]) as string[];

  const channels: NotificationChannel[] = [
    {
      type: NotificationChannelType.SMS,
      targets: [`+258${patient.phone.replace(/\D/g, '')}`],
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

  if (patient.email) channels.push({
    type: NotificationChannelType.EMAIL,
    targets: [patient.email],
  })

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: patient.userId,
    templateKey: NotificationTemplateKey.APPOINTMENT_JOIN_READY,
    templateData: {
      recipientName: patient.name,
      professionalName: professional.name,
      appointmentDateTime: appointmentDateTime,
      appointmentType: appointmentType
    },
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: appointmentId,
    relatedItemType: NotificationRelatedItemType.APPOINTMENT,
    payload: {
      href: patientDeepLink
    },
    channels: channels,
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}