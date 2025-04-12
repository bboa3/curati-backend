import { Logger } from "@aws-lambda-powertools/logger";
import type { AttributeValue } from "aws-lambda";
import { User } from '../../helpers/types/schema';
import { newPrescriptionAdminEmailNotifier } from '../helpers/new-prescription-admin-email-notifier';
import { newPrescriptionAdminSMSNotifier } from '../helpers/new-prescription-admin-sms-notifier';

interface TriggerInput {
  prescriptionImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postPrescriptionCreation = async ({ prescriptionImage, dbClient }: TriggerInput) => {
  const prescriptionNumber = prescriptionImage?.prescriptionNumber?.S;

  if (!prescriptionNumber) {
    throw new Error("Missing required prescription fields");
  }

  const { data: admins, errors: adminErrors } = await dbClient.models.user.list({
    filter: { role: { eq: 'ADMIN' } }
  });

  if (adminErrors || !admins || admins.length === 0) {
    throw new Error(`Failed to fetch admins: ${JSON.stringify(adminErrors)}`);
  }

  const emails = admins.map((p: User) => p.email).filter(Boolean) as string[];
  const phones = admins.map((p: User) => p.phone ? `+258${p.phone.replace(/\D/g, '')}` : null).filter(Boolean) as string[];
  if (emails.length > 0) {
    await newPrescriptionAdminEmailNotifier(
      emails,
      prescriptionNumber
    );
  }

  if (phones.length > 0) {
    await Promise.all(phones.map((phone) => phone ? newPrescriptionAdminSMSNotifier(phone, prescriptionNumber) : null));
  }
};