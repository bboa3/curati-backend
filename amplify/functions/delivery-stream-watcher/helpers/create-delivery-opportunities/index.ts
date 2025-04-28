import { Logger } from "@aws-lambda-powertools/logger";
import { Delivery } from "../../../helpers/types/schema";
import { Coordinate } from "../../../helpers/types/shared";
import { createDeliveryAssignment } from "./createDeliveryAssignments";
import { findEligibleDrivers } from "./findEligibleDrivers";
import { getAvailableDrivers } from "./getAvailableDrivers";

interface CreateDeliveryOpportunitiesInput {
  dbClient: any;
  logger: Logger;
  pharmacyLocation: Coordinate;
  delivery: Delivery
}

export const createDeliveryOpportunities = async ({
  dbClient,
  logger,
  pharmacyLocation,
  delivery
}: CreateDeliveryOpportunitiesInput): Promise<void> => {
  const drivers = await getAvailableDrivers({
    dbClient,
    logger,
    preferredDeliveryTimeStartAt: delivery.preferredDeliveryTimeStartAt,
    preferredDeliveryTimeEndAt: delivery.preferredDeliveryTimeEndAt
  });

  const eligibleDrivers = await findEligibleDrivers({
    dbClient,
    availableDrivers: drivers,
    pharmacyToPatientDistanceKm: delivery.distanceInKm,
    pharmacyToPatientDurationMinutes: delivery.estimatedDeliveryDuration,
    pharmacyLocation
  });

  if (eligibleDrivers.length === 0) {
    throw new Error("No eligible drivers found");
  }

  for (const driver of eligibleDrivers) {
    try {
      await createDeliveryAssignment({
        dbClient,
        deliveryId: delivery.orderId,
        driver
      });
    } catch (error: any) {
      logger.error(`Failed to create delivery assignment for driver ${driver.driverId}:`, error);
    }
  }

  logger.info(`Created ${eligibleDrivers.length} delivery opportunities`);
};
