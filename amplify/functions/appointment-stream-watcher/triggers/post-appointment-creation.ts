import { Logger } from "@aws-lambda-powertools/logger";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "aws-lambda";
import { Appointment, Contract } from '../../helpers/types/schema';

interface TriggerInput {
  appointmentImage: { [key: string]: AttributeValue; };
  dbClient: any;
  logger: Logger;
}

export const postAppointmentCreation = async ({ appointmentImage, dbClient }: TriggerInput) => {
  const appointment = unmarshall(appointmentImage as any) as Appointment;
  const { contractId } = appointment;

  const { data: contractData, errors: contractErrors } = await dbClient.models.contract.get({ id: contractId });

  if (contractErrors || !contractData) {
    throw new Error(`Failed to fetch contract: ${JSON.stringify(contractErrors)}`);
  }
  const contract = contractData as unknown as Contract;

  if ((contract.appointmentsAllowed - contract.appointmentsUsed) <= 0) {
    throw new Error(`Appointment limit reached for contract ${contractId}`);
  }

  const { errors: contractUpdateErrors } = await dbClient.models.contract.update({
    id: contractId,
    appointmentsUsed: contract.appointmentsUsed + 1
  })

  if (contractUpdateErrors) {
    throw new Error(`Failed to update contract: ${JSON.stringify(contractUpdateErrors)}`);
  }
};