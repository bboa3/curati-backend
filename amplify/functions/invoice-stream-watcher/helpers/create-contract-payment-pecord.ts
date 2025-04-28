import dayjs, { Dayjs } from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { ContractPayment } from "../../helpers/types/schema";

interface PaymentPeriod {
  start: Dayjs;
  end: Dayjs;
}

interface CreateContractPaymentParams {
  contractId: string;
  invoiceId: string;
  invoiceTotalAmount: number;
  paymentPeriod: PaymentPeriod;
  dbClient: any;
}

export const createContractPaymentRecord = async ({
  contractId,
  invoiceId,
  invoiceTotalAmount,
  paymentPeriod,
  dbClient,
}: CreateContractPaymentParams): Promise<ContractPayment> => {
  const now = dayjs.utc();

  const { data: createdPayment, errors } = await dbClient.models.contractPayment.create({
    id: generateUUIDv4(),
    contractId: contractId,
    periodStart: paymentPeriod.start.toISOString(),
    periodEnd: paymentPeriod.end.toISOString(),
    paymentDate: now.toISOString(),
    amount: invoiceTotalAmount,
    refundableAmount: invoiceTotalAmount,
    invoiceId: invoiceId,
  });

  if (errors || !createdPayment) {
    throw new Error(`Failed to create contract payment: ${JSON.stringify(errors)}`);
  }

  return createdPayment as ContractPayment;
};