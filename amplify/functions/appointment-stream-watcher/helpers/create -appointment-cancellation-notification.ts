import { v4 as generateUUIDv4 } from "uuid";
import { Appointment, AppointmentParticipantType, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User } from "../../helpers/types/schema";
import { deleteReminders } from "./delete-reminders";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  appointment: Appointment;
}

export const createAppointmentCancellationNotification = async ({ appointment, professional, patient, dbClient }: NotifierInput) => {
  const { id: appointmentId, appointmentNumber, appointmentDateTime, type: appointmentType, purpose } = appointment;
  const patientDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
  const professionalDeepLink = `curati://life.curati.rx/(app)/profile/appointments/${appointmentId}`;

  const newAppointmentDeepLink = `curati://life.curati.www/(app)/(tabs)/services`;

  const { data: patientUserData, errors: patientUserErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (patientUserErrors || !patientUserData) {
    throw new Error(`Failed to fetch notification patient user: ${JSON.stringify(patientUserErrors)}`);
  }
  const patientUser = patientUserData as unknown as User;

  const { data: professionalUserData, errors: professionalUserErrors } = await dbClient.models.user.get({ authId: professional.userId });

  if (professionalUserErrors || !professionalUserData) {
    throw new Error(`Failed to fetch notification professional user: ${JSON.stringify(professionalUserErrors)}`);
  }
  const professionalUser = professionalUserData as unknown as User;

  const recipients = [
    {
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      pushTokens: patientUser.pushTokens as string[],
      type: AppointmentParticipantType.PATIENT,
      otherPartyName: professional.name,
      deepLink: patientDeepLink
    },
    {
      userId: professional.userId,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      pushTokens: professionalUser.pushTokens as string[],
      type: AppointmentParticipantType.PROFESSIONAL,
      otherPartyName: patient.name,
      deepLink: professionalDeepLink
    }
  ]

  await Promise.all(recipients.map(async recipient => {
    const channels: NotificationChannel[] = [
      {
        type: NotificationChannelType.SMS,
        targets: [`+258${recipient.phone.replace(/\D/g, '')}`],
      },
      {
        type: NotificationChannelType.PUSH,
        targets: recipient.pushTokens as string[],
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
      templateKey: NotificationTemplateKey.APPOINTMENT_CANCELLED,
      templateData: {
        recipientName: recipient.name,
        recipientType: recipient.type,
        otherPartyName: recipient.otherPartyName,
        appointmentNumber: appointmentNumber,
        appointmentDateTime: appointmentDateTime,
        appointmentType: appointmentType,
        purpose: purpose,
        cancellationReason: appointment.cancellationReason,
        newAppointmentDeepLink: newAppointmentDeepLink
      },
      type: NotificationType.PERSONAL,
      priority: Priority.HIGH,
      bypassPreferences: false,
      relatedItemId: appointmentId,
      relatedItemType: NotificationRelatedItemType.APPOINTMENT,
      payload: {
        href: recipient.deepLink
      },
      channels: channels,
      status: NotificationStatus.PENDING,
    })

    if (createNotificationErrors) {
      throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
    }
  }))

  await deleteReminders({
    dbClient,
    appointmentId,
    recipients: recipients.map(({ userId }) => ({ userId }))
  })
}