import { v4 as generateUUIDv4 } from "uuid";
import { Address, Business, Delivery, MedicineOrder, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  delivery: Delivery;
  driver: Professional;
  pharmacy: Business;
  pharmacyAddress: Address;
  destinationAddress: Address;
  order: MedicineOrder;
}

export const createDeliveryTaskDriverUpdateNotification = async ({ delivery, driver, pharmacy, pharmacyAddress, destinationAddress, order, dbClient }: NotifierInput) => {
  const { orderId: deliveryId, deliveryNumber } = delivery;
  const driverStatsDeepLink = `curati://life.curati.go/(app)/`;

  const { data: driverUserData, errors: driverUserErrors } = await dbClient.models.user.get({ authId: driver.userId });

  if (driverUserErrors || !driverUserData) {
    throw new Error(`Failed to fetch notification driver user: ${JSON.stringify(driverUserErrors)}`);
  }
  const driverUser = driverUserData as unknown as User;
  const driverPushTokens = driverUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PROFESSIONAL)
  const pushTokens = driverPushTokens.map(token => token?.split(' ')[0]) as string[];

  const channels: NotificationChannel[] = [
    {
      type: NotificationChannelType.PUSH,
      targets: pushTokens,
    },
    {
      type: NotificationChannelType.IN_APP,
      targets: [],
    }
  ];

  if (driver.email) channels.push({
    type: NotificationChannelType.EMAIL,
    targets: [driver.email],
  })

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: driver.userId,
    templateKey: NotificationTemplateKey.DELIVERY_TASK_DRIVER_UPDATE,
    templateData: JSON.stringify({
      recipientName: driver.name,
      deliveryNumber: deliveryNumber,
      orderNumber: order.orderNumber,
      newDeliveryStatus: delivery.status,
      pharmacyName: pharmacy.name,
      pharmacyAddressSnippet: `${pharmacyAddress.neighborhoodOrDistrict}, ${pharmacyAddress.city}, ${pharmacyAddress.province}`,
      patientAddressSnippet: `${destinationAddress.neighborhoodOrDistrict}, ${destinationAddress.city}, ${destinationAddress.province}`,
    }),
    type: NotificationType.PERSONAL,
    priority: Priority.MEDIUM,
    bypassPreferences: false,
    relatedItemId: deliveryId,
    relatedItemType: NotificationRelatedItemType.ORDER,
    payload: {
      href: driverStatsDeepLink
    },
    channels: JSON.stringify(channels),
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}