import { v4 as generateUUIDv4 } from "uuid";
import { BusinessService, Contract, Invoice, InvoiceSourceType, MedicineOrder, NotificationChannel, NotificationChannelType, NotificationRelatedItemType, NotificationStatus, NotificationTemplateKey, NotificationType, Patient, Priority, User, UserRole } from "../../helpers/types/schema";

interface NotifierInput {
  dbClient: any;
  patient: Patient;
  order?: MedicineOrder;
  invoice: Invoice;
  contract?: Contract;
  service?: BusinessService;
}

export const createInvoiceStatusPatientUpdateNotification = async ({ invoice, service, contract, patient, order, dbClient }: NotifierInput) => {
  const invoiceDeepLink = `curati://life.curati.www/(app)/profile/invoices/${invoice.id}`

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
    templateKey: NotificationTemplateKey.INVOICE_STATUS_UPDATED,
    templateData: JSON.stringify({
      recipientName: patient.name,
      invoiceNumber: invoice.invoiceNumber,
      newInvoiceStatus: invoice.status,
      invoiceSubTotal: invoice.subTotal,
      invoiceDiscount: invoice.discount,
      invoiceTotalTax: invoice.taxes,
      totalDeliveryFee: invoice.deliveryFee,
      invoiceTotalAmount: invoice.totalAmount,
      invoiceSourceType: invoice.invoiceSourceType,
      invoiceDueDate: invoice.dueDate,
      paymentOrActionDate: invoice.updatedAt,
      contractNumber: contract?.contractNumber,
      serviceName: service?.serviceName,
      professionalName: service?.professionalName,
      orderNumber: order?.orderNumber,
      invoiceDocumentUrl: invoice.documentUrl,
    }),
    type: NotificationType.PERSONAL,
    priority: Priority.MEDIUM,
    bypassPreferences: false,
    relatedItemId: invoice.id,
    relatedItemType: invoice.invoiceSourceType === InvoiceSourceType.CONTRACT ? NotificationRelatedItemType.CONTRACT : NotificationRelatedItemType.ORDER,
    payload: {
      href: invoiceDeepLink
    },
    channels: JSON.stringify(channels),
    status: NotificationStatus.PENDING,
  })

  if (createNotificationErrors) {
    throw new Error(`Failed to create notification: ${JSON.stringify(createNotificationErrors)}`);
  }
}