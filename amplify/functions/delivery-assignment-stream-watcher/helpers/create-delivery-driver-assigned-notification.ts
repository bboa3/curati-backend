import { v4 as generateUUIDv4 } from "uuid";
import { Business, Delivery, DeliveryAssignment, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  delivery: Delivery;
  driver: Professional;
  patient: Patient;
  pharmacy: Business;
  assignment: DeliveryAssignment;
}

export const createDeliveryDriverAssignedNotification = async ({ delivery, driver, patient, pharmacy, assignment, dbClient }: NotifierInput) => {
  const { orderId: deliveryId, deliveryNumber } = delivery;
  const assignedDeliveryDeepLink = `curati://life.curati.go/(app)/(tabs)/`;
  const deliveryTrackingDeepLink = `curati://life.curati.www/(app)/profile/deliveries/${deliveryId}`;

  const { data: patientUserData, errors: patientUserErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (patientUserErrors || !patientUserData) {
    throw new Error(`Failed to fetch notification patient user: ${JSON.stringify(patientUserErrors)}`);
  }
  const patientUser = patientUserData as unknown as User;

  const { data: driverUserData, errors: driverUserErrors } = await dbClient.models.user.get({ authId: driver.userId });

  if (driverUserErrors || !driverUserData) {
    throw new Error(`Failed to fetch notification driver user: ${JSON.stringify(driverUserErrors)}`);
  }
  const driverUser = driverUserData as unknown as User;

  const recipients = [
    {
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      pushTokens: patientUser.pushTokens as string[],
      type: UserRole.PATIENT,
      driverName: driver.name,
      deepLink: deliveryTrackingDeepLink
    },
    {
      userId: driver.userId,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      pushTokens: driverUser.pushTokens as string[],
      type: UserRole.PROFESSIONAL,
      driverName: driver.name,
      deepLink: assignedDeliveryDeepLink
    }
  ]

  await Promise.all(recipients.map(async recipient => {
    const driverPushTokens = recipient.pushTokens?.filter(token => token?.split(' ')[1] === recipient.type)
    const pushTokens = driverPushTokens.map(token => token?.split(' ')[0]) as string[];

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
      templateKey: NotificationTemplateKey.DELIVERY_DRIVER_ASSIGNED,
      templateData: {
        recipientName: recipient.name,
        recipientType: recipient.type,
        deliveryNumber: deliveryNumber,
        driverName: recipient.driverName,
        deliveryWindowStartTime: delivery.preferredDeliveryTimeStartAt,
        deliveryWindowEndTime: delivery.preferredDeliveryTimeEndAt,
        pharmacyName: pharmacy.name,
        pharmacyAddressSnippet: assignment.pickupSnippet,
        patientGeneralLocationSnippet: assignment.destinationSnippet
      },
      type: NotificationType.PERSONAL,
      priority: Priority.HIGH,
      bypassPreferences: false,
      relatedItemId: deliveryId,
      relatedItemType: NotificationRelatedItemType.ORDER,
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
}