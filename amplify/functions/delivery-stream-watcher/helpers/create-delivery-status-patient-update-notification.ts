import { v4 as generateUUIDv4 } from "uuid";
import { Address, Business, Delivery, MedicineOrder, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  delivery: Delivery;
  patient: Patient;
  pharmacy: Business;
  pharmacyAddress: Address;
  driver?: Professional | null;
  order: MedicineOrder;
}

export const createDeliveryStatusPatientUpdateNotification = async ({ delivery, driver, patient, pharmacy, pharmacyAddress, order, dbClient }: NotifierInput) => {
  const { orderId: deliveryId, deliveryNumber } = delivery;
  const orderDeepLink = `curati://life.curati.www/(app)/profile/orders/${deliveryId}`;

  const { data: patientUserData, errors: patientUserErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (patientUserErrors || !patientUserData) {
    throw new Error(`Failed to fetch notification patient user: ${JSON.stringify(patientUserErrors)}`);
  }
  const patientUser = patientUserData as unknown as User;
  const patientPushTokens = patientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PATIENT)
  const pushTokens = patientPushTokens.map(token => token?.split(' ')[0]) as string[];

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

  if (patient.email) channels.push({
    type: NotificationChannelType.EMAIL,
    targets: [patient.email],
  })

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: patient.userId,
    templateKey: NotificationTemplateKey.DELIVERY_TASK_DRIVER_UPDATE,
    templateData: {
      recipientName: patient.name,
      deliveryNumber: deliveryNumber,
      orderNumber: order.orderNumber,
      newDeliveryStatus: delivery.status,
      pharmacyName: pharmacy.name,
      pharmacyAddressSnippet: `${pharmacyAddress.neighborhoodOrDistrict}, ${pharmacyAddress.city}, ${pharmacyAddress.province}`,
      driverName: driver?.name,
      estimatedDeliveryDurationMinutes: delivery.estimatedDeliveryDuration,
    },
    type: NotificationType.PERSONAL,
    priority: Priority.MEDIUM,
    bypassPreferences: false,
    relatedItemId: deliveryId,
    relatedItemType: NotificationRelatedItemType.ORDER,
    payload: {
      href: orderDeepLink
    },
    channels: channels,
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}