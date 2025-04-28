import { Logger } from "@aws-lambda-powertools/logger";
import { Professional, ProfessionalAvailability, ProfessionalType, PublicationStatus, RecurrencePattern, TimeSlot } from "../../../helpers/types/schema";
import { hasAvailabilityDuringWindow } from "./hasAvailabilityDuringWindow";

interface GetAvailableDriversInput {
  dbClient: any;
  logger: Logger;
  preferredDeliveryTimeStartAt: string;
  preferredDeliveryTimeEndAt: string;
}

interface ProfessionalAvailabilityAndRecurrencePattern {
  professionalAvailability: ProfessionalAvailability;
  recurrencePattern: RecurrencePattern;
}

export const getAvailableDrivers = async ({
  dbClient,
  logger,
  preferredDeliveryTimeStartAt,
  preferredDeliveryTimeEndAt
}: GetAvailableDriversInput): Promise<Professional[]> => {
  const BATCH_SIZE = 100;
  const allDrivers: Professional[] = [];
  const availabilityAndRecurrencePatternMap = new Map<string, ProfessionalAvailabilityAndRecurrencePattern>();

  let driverNextToken: string | null = null;
  do {
    const { data, errors, nextToken } = await dbClient.models.professional.list({
      filter: {
        professionalType: { eq: ProfessionalType.DRIVER },
        publicationStatus: { eq: PublicationStatus.PUBLISHED }
      },
      limit: BATCH_SIZE,
      nextToken: driverNextToken
    }) as any;

    if (errors) throw new Error(`Driver fetch error: ${JSON.stringify(errors)}`);
    if (data) allDrivers.push(...data);
    driverNextToken = nextToken;
  } while (driverNextToken);

  if (allDrivers.length === 0) return [];

  const driverIds = allDrivers.map(d => d.userId);
  for (let i = 0; i < driverIds.length; i += BATCH_SIZE) {
    const batch = driverIds.slice(i, i + BATCH_SIZE);
    let availabilityNextToken: string | null = null;

    do {
      const { data, errors, nextToken } = await dbClient.models.professionalAvailability.list({
        filter: {
          or: batch.map(id => ({ professionalId: { eq: id } }))
        },
        limit: BATCH_SIZE,
        nextToken: availabilityNextToken
      }) as any;

      if (errors) throw new Error(`Availability fetch error: ${JSON.stringify(errors)}`);
      if (data) {
        for (const availabilityData of data) {
          try {
            const { data: recurrencePattern, errors: patternErrors } =
              await availabilityData.recurrencePattern();

            if (patternErrors || !recurrencePattern) {
              logger.error(`Failed to fetch recurrence pattern for ${availabilityData.professionalId}`);
              continue;
            }

            const timeSlots = JSON.parse(availabilityData.timeSlots)

            availabilityAndRecurrencePatternMap.set(availabilityData.professionalId, {
              professionalAvailability: {
                ...availabilityData,
                timeSlots: timeSlots as TimeSlot[]
              },
              recurrencePattern: recurrencePattern as RecurrencePattern
            });
          } catch (e: any) {
            logger.error(`Error processing availability ${availabilityData.professionalId}`, e);
          }
        }
      }
      availabilityNextToken = nextToken;
    } while (availabilityNextToken);
  }

  const availableDrivers = allDrivers.filter(driver => {
    const availabilityAndRecurrence = availabilityAndRecurrencePatternMap.get(driver.userId);
    if (!availabilityAndRecurrence) return false;

    try {
      const { professionalAvailability, recurrencePattern } = availabilityAndRecurrence;

      return hasAvailabilityDuringWindow({
        professionalAvailability,
        recurrencePattern,
        preferredDeliveryTimeStartAt,
        preferredDeliveryTimeEndAt
      });
    } catch (e: any) {
      logger.error(`Invalid time slots for driver ${driver.userId}`, e);
      return false;
    }
  });

  logger.info(`Processed ${allDrivers.length} drivers in ${Math.ceil(driverIds.length / BATCH_SIZE)} batches, found ${availableDrivers.length} available`);
  return availableDrivers;
};