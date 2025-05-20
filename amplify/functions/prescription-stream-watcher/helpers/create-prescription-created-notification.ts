import { v4 as generateUUIDv4 } from "uuid";
import { NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Prescription, Priority, User } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  admins: User[];
  prescription: Prescription;
}

export const createPrescriptionCreatedNotification = async ({ admins, prescription, dbClient }: NotifierInput) => {
  const recipients = admins.map((admin) => ({
    userId: admin.authId,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    pushTokens: admin.pushTokens as string[]
  }));

  await Promise.all(recipients.map(async recipient => {
    const channels: NotificationChannel[] = [
      {
        type: NotificationChannelType.SMS,
        targets: [`+258${recipient.phone.replace(/\D/g, '')}`],
      },
    ];

    if (recipient.email) channels.push({
      type: NotificationChannelType.EMAIL,
      targets: [recipient.email],
    })

    const { errors: createNotificationErrors } = await dbClient.models.notification.create({
      id: generateUUIDv4(),
      userId: recipient.userId,
      templateKey: NotificationTemplateKey.PRESCRIPTION_VALIDATION_REQUIRED,
      templateData: JSON.stringify({
        recipientName: recipient.name,
        prescriptionNumber: prescription.prescriptionNumber,
      }),
      type: NotificationType.UPDATE,
      priority: Priority.HIGH,
      bypassPreferences: false,
      relatedItemId: prescription.id,
      relatedItemType: NotificationRelatedItemType.PRESCRIPTION,
      payload: {
      },
      channels: JSON.stringify(channels),
      status: NotificationStatus.PENDING,
    })

    if (createNotificationErrors) {
      throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
    }
  }))
}