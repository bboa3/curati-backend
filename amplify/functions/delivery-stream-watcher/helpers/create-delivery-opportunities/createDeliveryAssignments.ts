import dayjs from "dayjs";
import { v4 as generateUUIDv4 } from "uuid";
import { Address, Delivery, DeliveryAssignment, DeliveryAssignmentStatus } from "../../../helpers/types/schema";
import { driverCommissionCalculator } from "./driverCommissionCalculator";
import { DriverEligibility } from "./findEligibleDrivers";

interface CreateDeliveryAssignmentsInput {
  dbClient: any;
  delivery: Delivery;
  driver: DriverEligibility;
  pharmacyAddress: Address;
  deliveryAddress: Address;
}

const DELIVERY_OPPORTUNITY_DURATION = 60;

export const createDeliveryAssignment = async ({ dbClient, pharmacyAddress, deliveryAddress, delivery, driver }: CreateDeliveryAssignmentsInput) => {

  const { data, errors } = await dbClient.models.deliveryAssignment.create({
    id: generateUUIDv4(),
    deliveryId: delivery.orderId,
    driverId: driver.driverId,
    courierId: driver.courierId,
    status: DeliveryAssignmentStatus.PENDING,
    expiresAt: dayjs.utc().add(DELIVERY_OPPORTUNITY_DURATION, 'minute').toISOString(),
    estimatedDriverCommission: driverCommissionCalculator(delivery.totalDeliveryFee),
    pickupSnippet: `${pharmacyAddress.neighborhoodOrDistrict}, ${pharmacyAddress.city}`,
    destinationSnippet: `${deliveryAddress.neighborhoodOrDistrict}, ${deliveryAddress.city}`,
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
