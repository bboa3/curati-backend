import { v4 as generateUUIDv4 } from "uuid";
import { Appointment, AppointmentParticipantType, AppointmentStatus, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User } from "../../helpers/types/schema";
import { createReminders } from "./create-reminders";
import { deleteReminders } from "./delete-reminders";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  appointment: Appointment;
  oldImageAppointmentStatus: AppointmentStatus;
}

export const createAppointmentConfirmationNotification = async ({ appointment, professional, patient, dbClient, oldImageAppointmentStatus }: NotifierInput) => {
  const { id: appointmentId, appointmentNumber, duration, appointmentDateTime, type: appointmentType, purpose } = appointment;
  const patientDeepLink = `curati://life.curati.www/(app)/profile/appointments/${appointmentId}`;
  const professionalDeepLink = `curati://life.curati.rx/(app)/profile/appointments/${appointmentId}`;

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
    const professionalPushTokens = recipient.pushTokens?.filter(token => token?.split(' ')[1] === recipient.type)
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
      templateKey: NotificationTemplateKey.APPOINTMENT_CONFIRMED,
      templateData: JSON.stringify({
        recipientName: recipient.name,
        recipientType: recipient.type,
        otherPartyName: recipient.otherPartyName,
        appointmentNumber: appointmentNumber,
        appointmentDateTime: appointmentDateTime,
        duration: duration,
        appointmentType: appointmentType,
        purpose: purpose,
      }),
      type: NotificationType.PERSONAL,
      priority: Priority.HIGH,
      bypassPreferences: false,
      relatedItemId: appointmentId,
      relatedItemType: NotificationRelatedItemType.APPOINTMENT,
      payload: {
        href: recipient.deepLink
      },
      channels: JSON.stringify(channels),
      status: NotificationStatus.PENDING,
    })

    if (createNotificationErrors) {
      throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
    }
  }))

  if (oldImageAppointmentStatus === AppointmentStatus.RESCHEDULED) {
    await deleteReminders({
      dbClient,
      appointmentId,
      recipients: recipients.map(({ userId }) => ({ userId }))
    })
  }

  await createReminders({
    dbClient,
    appointmentDateTime,
    purpose,
    professionalType: professional.type,
    appointmentType,
    appointmentId,
    recipients: recipients.map(recipient => ({
      userId: recipient.userId,
      type: recipient.type,
      otherPartyName: recipient.otherPartyName
    }))
  })
}