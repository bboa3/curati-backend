import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from "dayjs";
import DistanceCalculator from "../../helpers/calculateDistance";
import { DriverCurrentLocation, Professional, ProfessionalAvailability, ProfessionalAvailabilityStatus, ProfessionalType, Vehicle } from "../../helpers/types/schema";
import { CuratiLocation } from "../../helpers/types/shared";

interface DriverLocation extends CuratiLocation {
  driverId: string
  timestamp: string
}

interface PickBestDriverInput {
  client: any;
  logger: Logger;
  pharmacyLocation: CuratiLocation
}

interface PickBestDriverOutput {
  driver: Professional;
  vehicle: Vehicle;
}

const distanceCalculator = new DistanceCalculator();

export const pickBestDriver = async ({ client, logger, pharmacyLocation }: PickBestDriverInput): Promise<PickBestDriverOutput | null> => {
  const { data: availabilityData, errors: availabilityErrors } = await client.models.professionalAvailability.list({
    filter: {
      currentAvailabilityStatus: { eq: ProfessionalAvailabilityStatus.ONLINE },
      professionalType: { eq: ProfessionalType.DRIVER }
    },
    limit: 1000
  });

  if (availabilityErrors || !availabilityData || availabilityData.length === 0) {
    logger.error("Failed to fetch driver availability", { errors: availabilityErrors });
    return null;
  }
  const availabilities = availabilityData as ProfessionalAvailability[];
  const availableDriverIds = new Set<string>();

  for (const avail of availabilities) {
    if (avail.currentAvailabilityStatus === ProfessionalAvailabilityStatus.ONLINE) {
      availableDriverIds.add(avail.professionalId);
    }
  }

  if (availableDriverIds.size === 0) {
    logger.warn("No drivers are currently ONLINE.");
    return null;
  }
  logger.info(`${availableDriverIds.size} drivers are currently ONLINE.`);

  const onlineDriverLocations: DriverLocation[] = [];
  const driverIdsToCheck = Array.from(availableDriverIds);

  const locationFilters = driverIdsToCheck.map(id => ({ driverId: { eq: id } }));

  const { data: locationsData, errors: locationsErrors } = await client.models.driverCurrentLocation.list({
    filter: {
      and: [
        { or: locationFilters },
        { timestamp: { gt: dayjs.utc().subtract(5, 'minute').toISOString() } }
      ]
    },
    limit: 1000
  });

  if (locationsErrors || !locationsData || locationsData.length === 0) {
    logger.error("Failed to fetch current drivers location", { errors: locationsErrors });
    return null;
  }

  const driversLocation = locationsData as DriverCurrentLocation[];

  for (const location of driversLocation) {
    onlineDriverLocations.push({
      driverId: location.driverId,
      lat: location.latitude,
      lng: location.longitude,
      timestamp: location.timestamp,
    });
  }

  if (onlineDriverLocations.length === 0) {
    logger.warn("Could not find any ONLINE drivers with valid, recent location data.");
    return null;
  }

  logger.info(`Found ${onlineDriverLocations.length} drivers with valid recent locations after individual checks.`);

  const driversWithDistance = onlineDriverLocations.map(loc => {
    const distance = distanceCalculator.calculateDistance({
      startPoint: pharmacyLocation,
      destination: { lat: loc.lat, lng: loc.lng }
    });
    return { ...loc, distance };
  }).sort((a, b) => a.distance - b.distance);

  const closestDriverWithDistance = driversWithDistance[0];
  logger.info(`Closest driver found: ${closestDriverWithDistance.driverId} at ${closestDriverWithDistance.distance.toFixed(2)} m distance.`);

  const { data: vehicleData, errors: vehicleErrors } = await client.models.vehicle.list({
    filter: { driverId: { eq: closestDriverWithDistance.driverId } },
  });

  if (vehicleErrors || !vehicleData || vehicleData.length === 0) {
    logger.error("Failed to fetch vehicle for the selected driver or driver has no vehicle assigned", { driverId: closestDriverWithDistance.driverId, errors: vehicleErrors });
    return null;
  }
  const selectedVehicle = vehicleData[0] as Vehicle;

  const { data: driverData, errors: driverErrors } = await client.models.professional.get({
    userId: closestDriverWithDistance.driverId
  })

  if (driverErrors || !driverData) {
    logger.error("Failed to fetch driver for the selected driver", { driverId: closestDriverWithDistance.driverId, errors: driverErrors });
    return null;
  }
  const selectedDriver = driverData as Professional

  const { errors: availabilityUpdateErrors } = await client.models.professionalAvailability.update({
    professionalId: selectedDriver.userId,
    currentAvailabilityStatus: ProfessionalAvailabilityStatus.BUSY
  });

  if (availabilityUpdateErrors) {
    logger.error("Failed to update driver availability", { errors: availabilityUpdateErrors });
    return null;
  }

  return {
    driver: selectedDriver,
    vehicle: selectedVehicle,
  };
};