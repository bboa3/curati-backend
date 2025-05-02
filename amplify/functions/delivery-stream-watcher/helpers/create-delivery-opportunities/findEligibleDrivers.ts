import dayjs from "dayjs";
import DistanceCalculator from "../../../helpers/calculateDistance";
import { DriverCurrentLocation, Professional } from "../../../helpers/types/schema";
import { Coordinate } from "../../../helpers/types/shared";
import { calculateTotalEstimatedDuration } from "./calculateEstimatedDuration";

const distanceCalculator = new DistanceCalculator();

interface FindEligibleDriversInput {
  dbClient: any;
  availableDrivers: Professional[];
  pharmacyToPatientDurationMinutes: number;
  pharmacyToPatientDistanceKm: number;
  pharmacyLocation: Coordinate;
}

export interface DriverEligibility {
  driverId: string;
  courierId: string;
  totalDistance: number;
  totalDuration: number;
  distanceToPharmacy: number;
  distanceToPatient: number;
  location: Coordinate;
  lastUpdate: string;
}

const ALLOWED_DRIVER_LOCATION_AGE_IN_MINUTES = 30;
const MAX_ELIGIBLE_DRIVERS = 10;
const LOCATION_BATCH_SIZE = 50;
const LOCATION_CUTOFF_TIME = dayjs.utc().subtract(ALLOWED_DRIVER_LOCATION_AGE_IN_MINUTES, 'minute').toISOString();

/**
  * Given a list of available drivers and pharmacy-to-patient precalculated distance and duration, returns
  * up to MAX_ELIGIBLE_DRIVERS drivers who are eligible to fulfill the delivery,
  * sorted by their total distance to the pharmacy and patient.
  *
  * A driver is eligible if they are currently online and have a valid recent
  * location. The total distance is calculated by summing the distance from the
  * driver's current location to the pharmacy and the distance from the pharmacy to
  * the patient.
  *
  * @param dbClient - The AppSync client to use for fetching driver locations
  * @param availableDrivers - The list of available drivers to consider
  * @param pharmacyToPatientDurationMinutes - The precalculated and saved delivery duration from the pharmacy to the patient in minutes
  * @param pharmacyToPatientDistanceKm - The precalculated and saved delivery distance from the pharmacy to the patient in kilometers
  * @param pharmacyLocation - The location of the pharmacy as a { lat, lng } object
  * @returns An array of up to MAX_ELIGIBLE_DRIVERS drivers, sorted by their total distance
  * @throws If no ONLINE drivers with valid recent locations are found
  */
export const findEligibleDrivers = async ({
  dbClient,
  availableDrivers,
  pharmacyToPatientDurationMinutes,
  pharmacyToPatientDistanceKm,
  pharmacyLocation,
}: FindEligibleDriversInput): Promise<DriverEligibility[]> => {
  const driversLocation = [] as DriverCurrentLocation[];


  for (let i = 0; i < availableDrivers.length; i += LOCATION_BATCH_SIZE) {
    const batch = availableDrivers.slice(i, i + LOCATION_BATCH_SIZE);
    const locationFilters = batch.map(({ userId }) => ({ driverId: { eq: userId } }));

    const { data, errors } = await dbClient.models.driverCurrentLocation.list({
      filter: {
        and: [
          { or: locationFilters },
          { timestamp: { gt: LOCATION_CUTOFF_TIME } }
        ]
      },
      limit: 1000
    });

    if (errors) throw new Error(`Location batch failed: ${JSON.stringify(errors)}`);
    driversLocation.push(...(data || []));
  }

  if (driversLocation.length === 0) {
    throw new Error("No ONLINE drivers with valid recent locations");
  }

  const driverMap: Map<string, Professional> = new Map(availableDrivers.map(driver => [driver.userId, driver]));

  const eligibleDrivers: DriverEligibility[] = driversLocation.map(loc => {
    const driverLoc = { lat: loc.latitude, lng: loc.longitude };

    const toPharmacyKm = distanceCalculator.calculateAndFormatDistanceInKm({
      startPoint: driverLoc,
      destination: pharmacyLocation
    });

    const totalDistance = toPharmacyKm + pharmacyToPatientDistanceKm;

    const totalDuration = calculateTotalEstimatedDuration({
      pharmacyToPatientDurationMinutes,
      driverToPharmacyDistance: toPharmacyKm
    })

    const driver = driverMap.get(loc.driverId);

    if (!driver) {
      throw new Error(`Driver ${loc.driverId} not found in the driver Map`);
    }

    return {
      driverId: driver.userId,
      courierId: driver.businessId,
      totalDistance,
      totalDuration,
      distanceToPharmacy: toPharmacyKm,
      distanceToPatient: pharmacyToPatientDistanceKm,
      lastUpdate: loc.timestamp,
      location: driverLoc
    }
  }).sort((a, b) => a.totalDistance - b.totalDistance)
    .slice(0, MAX_ELIGIBLE_DRIVERS)

  return eligibleDrivers
};