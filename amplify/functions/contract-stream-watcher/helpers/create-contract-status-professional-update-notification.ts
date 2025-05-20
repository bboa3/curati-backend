import { v4 as generateUUIDv4 } from "uuid";
import { BusinessService, Contract, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, Professional, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  professional: Professional;
  contract: Contract;
  service: BusinessService;
}

export const createContractStatusProfessionalUpdateNotification = async ({ contract, professional, patient, service, dbClient }: NotifierInput) => {
  const contractDeepLink = `curati://life.curati.www/(app)/profile/contracts/${contract.id}`;

  const { data: recipientUserData, errors: recipientUserErrors } = await dbClient.models.user.get({ authId: professional.userId });

  if (recipientUserErrors || !recipientUserData) {
    throw new Error(`Failed to fetch notification recipient user: ${JSON.stringify(recipientUserErrors)}`);
  }
  const recipientUser = recipientUserData as unknown as User;

  const professionalPushTokens = recipientUser.pushTokens?.filter(token => token?.split(' ')[1] === UserRole.PROFESSIONAL)
  const pushTokens = professionalPushTokens.map(token => token?.split(' ')[0]) as string[];

  const channels: NotificationChannel[] = [
    {
      type: NotificationChannelType.SMS,
      targets: [`+258${professional.phone.replace(/\D/g, '')}`],
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

  if (professional.email) channels.push({
    type: NotificationChannelType.EMAIL,
    targets: [professional.email],
  })

  const { errors: createNotificationErrors } = await dbClient.models.notification.create({
    id: generateUUIDv4(),
    userId: professional.userId,
    templateKey: NotificationTemplateKey.CONTRACT_STATUS_PROFESSIONAL_UPDATE,
    templateData: JSON.stringify({
      recipientName: professional.name,
      contractNumber: contract.contractNumber,
      newContractStatus: contract.status,
      serviceName: service.serviceName,
      contractType: contract.type,
      patientName: patient.name,
      statusUpdateDate: contract.updatedAt,
      contractEndDate: contract.nextRenewalDate,
      confirmationDueDate: contract.confirmationDueAt,
      terminationReason: contract.terminationReason,
      terminatedBy: contract.terminatedBy,
      additionalMessage: contract.notes
    }),
    type: NotificationType.PERSONAL,
    priority: Priority.HIGH,
    bypassPreferences: false,
    relatedItemId: contract.id,
    relatedItemType: NotificationRelatedItemType.CONTRACT,
    payload: {
      href: contractDeepLink
    },
    channels: JSON.stringify(channels),
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}