import { Logger } from "@aws-lambda-powertools/logger";
import { Address, Delivery } from "../../../helpers/types/schema";
import { createDeliveryAssignment } from "./createDeliveryAssignments";
import { findEligibleDrivers } from "./findEligibleDrivers";
import { getAvailableDrivers } from "./getAvailableDrivers";

interface CreateDeliveryOpportunitiesInput {
  dbClient: any;
  logger: Logger;
  delivery: Delivery
  pharmacyAddress: Address;
  deliveryAddress: Address;
}

export const createDeliveryOpportunities = async ({
  dbClient,
  logger,
  delivery,
  pharmacyAddress,
  deliveryAddress
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
    pharmacyLocation: {
      lat: pharmacyAddress.latitude || 0,
      lng: pharmacyAddress.longitude || 0
    }
  });

  if (eligibleDrivers.length === 0) {
    throw new Error("No eligible drivers found");
  }

  for (const driver of eligibleDrivers) {
    try {
      await createDeliveryAssignment({
        dbClient,
        delivery,
        pharmacyAddress,
        deliveryAddress,
        driver
      });
    } catch (error: any) {
      logger.error(`Failed to create delivery assignment for driver ${driver.driverId}:`, error);
    }
  }

  logger.info(`Created ${eligibleDrivers.length} delivery opportunities`);
};
