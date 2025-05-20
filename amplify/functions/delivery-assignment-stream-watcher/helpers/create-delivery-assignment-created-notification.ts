import { v4 as generateUUIDv4 } from "uuid";
import { Delivery, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  delivery: Delivery;
  driver: Professional;
}

export const createDeliveryAssignmentCreatedNotification = async ({ delivery, driver, dbClient }: NotifierInput) => {
  const deliveryOpportunityDeepLink = `curati://life.curati.go/(app)/(tabs)/`;

  const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: driver.userId });

  if (recipientUserErrors || !recipientUserData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
  }
  const recipientUser = recipientUserData as unknown as User;
  const professionalPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PROFESSIONAL)
  const pushTokens = professionalPushTokens.map(token => token?.split(' ')[0]) as string[];

  const channels: NotificationChannel[] = [
    {
      type: NotificationChannelType.SMS,
      targets: [`+258${driver.phone.replace(/\D/g, '')}`],
    },
    {
      type: NotificationChannelType.PUSH,
      targets: pushTokens,
    }
  ];

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: driver.userId,
    templateKey: NotificationTemplateKey.DELIVERY_ASSIGNMENT_AVAILABLE,
    templateData: {
      recipientName: driver.name,
      deliveryNumber: delivery.deliveryNumber,
      offerExpiryInfo: "Disponível por tempo muito limitado."
    },
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: delivery.orderId,
    relatedItemType: NotificationRelatedItemType.ORDER,
    payload: {
      href: deliveryOpportunityDeepLink
    },
    channels: channels,
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}