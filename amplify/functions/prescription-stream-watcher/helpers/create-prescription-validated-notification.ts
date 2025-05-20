import { v4 as generateUUIDv4 } from "uuid";
import { NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Prescription, Priority, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  prescription: Prescription;
}

export const createPrescriptionValidatedNotification = async ({ prescription, patient, dbClient }: NotifierInput) => {
  const { id: prescriptionId, prescriptionNumber, status: prescriptionStatus, notes } = prescription;
  const { name } = patient as unknown as Patient;
  const prescriptionDeepLink = `curati://life.curati.www/(app)/profile/prescriptions/${prescriptionId}`;

  const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (recipientUserErrors || !recipientUserData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
  }
  const recipientUser = recipientUserData as unknown as User;
  const professionalPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PATIENT)
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
    templateKey: NotificationTemplateKey.PRESCRIPTION_STATUS_UPDATED,
    templateData: JSON.stringify({
      recipientName: name,
      prescriptionNumber: prescriptionNumber,
      prescriptionStatus: prescriptionStatus,
      statusReason: notes || "Validada pelo farmacéutico",
    }),
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: prescriptionId,
    relatedItemType: NotificationRelatedItemType.PRESCRIPTION,
    payload: {
      href: prescriptionDeepLink
    },
    channels: JSON.stringify(channels),
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}