import { v4 as generateUUIDv4 } from "uuid";
import { BusinessService, Contract, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  contract: Contract;
  service: BusinessService;
}

export const createContractStatusPatientUpdateNotification = async ({ contract, patient, service, dbClient }: NotifierInput) => {
  const contractDeepLink = `curati://life.curati.www/(app)/profile/contracts/${contract.id}`;

  const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: patient.userId });

  if (recipientUserErrors || !recipientUserData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
  }
  const recipientUser = recipientUserData as unknown as User;

  const patientPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PATIENT)
  const pushTokens = patientPushTokens.map(token => token?.split(' ')[0]) as string[];

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
    templateKey: NotificationTemplateKey.CONTRACT_STATUS_PATIENT_UPDATE,
    templateData: {
      recipientName: patient.name,
      contractNumber: contract.contractNumber,
      newContractStatus: contract.status,
      serviceName: service.serviceName,
      contractType: contract.type,
      patientName: patient.name,
      contractSubmissionDate: contract.createdAt,
      statusUpdateDate: contract.updatedAt,
      nextRenewalDate: contract.nextRenewalDate,
      terminationReason: contract.terminationReason,
      terminatedBy: contract.terminatedBy,
      additionalMessage: contract.notes
    },
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: contract.id,
    relatedItemType: NotificationRelatedItemType.CONTRACT,
    payload: {
      href: contractDeepLink
    },
    channels: channels,
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}