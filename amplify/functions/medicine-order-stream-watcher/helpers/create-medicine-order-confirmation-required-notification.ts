import { v4 as generateUUIDv4 } from "uuid";
import { Business, Delivery, MedicineOrder, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  pharmacists: Professional[];
  order: MedicineOrder;
  pharmacy: Business;
  delivery: Delivery;
}

export const createMedicineOrderConfirmationRequiredNotification = async ({ pharmacists, order, pharmacy, delivery, dbClient }: NotifierInput) => {
  await Promise.all(pharmacists.map(async recipient => {
    const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: recipient.userId });

    if (recipientUserErrors || !recipientUserData) {
      throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
    }
    const recipientUser = recipientUserData as unknown as User;
    const recipientPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PROFESSIONAL)
    const pushTokens = recipientPushTokens.map(token => token?.split(' ')[0]) as string[];

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
      templateKey: NotificationTemplateKey.MEDICINE_ORDER_CREATED,
      templateData: {
        recipientName: recipient.name,
        recipientRole: UserRole.PROFESSIONAL,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        pharmacyName: pharmacy.name,
        deliveryType: delivery.type,
      },
      type: NotificationType.UPDATE,
      priority: Priority.HIGH,
      bypassPreferences: false,
      relatedItemId: order.id,
      relatedItemType: NotificationRelatedItemType.ORDER,
      payload: {
      },
      channels: channels,
      status: NotificationStatus.PENDING,
    })

    if (createNotificationErrors) {
      throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
    }
  }))
}