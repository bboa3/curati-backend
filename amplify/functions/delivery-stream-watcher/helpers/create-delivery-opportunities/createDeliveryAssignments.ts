import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { DeliveryAssignment, DeliveryAssignmentStatus } from "../../../helpers/types/schema";
import { DriverEligibility } from "./findEligibleDrivers";

interface CreateDeliveryAssignmentsInput {
  dbClient: any;
  deliveryId: string;
  driver: DriverEligibility;
}

const DELIVERY_OPPORTUNITY_DURATION = 30;

export const createDeliveryAssignment = async ({ dbClient, deliveryId, driver }: CreateDeliveryAssignmentsInput) => {

  const { data, errors } = dbClient.models.deliveryAssignment.create({
    id: generateUUIDv4(),
    deliveryId,
    driverId: driver.driverId,
    status: DeliveryAssignmentStatus.PENDING,
    expiresAt: dayjs.utc().add(DELIVERY_OPPORTUNITY_DURATION, 'minute').toISOString(),
    estimatedDistance: driver.totalDistance,
    estimatedDuration: driver.totalDuration,
    driverLocationLatitude: driver.location.lat,
    driverLocationLongitude: driver.location.lng,
  });

  if (errors) {
    throw new Error(`Failed to create delivery assignment: ${JSON.stringify(errors)}`);
  }

  return data as DeliveryAssignment;
};