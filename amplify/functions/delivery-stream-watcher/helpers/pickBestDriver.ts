import { Logger } from "@aws-lambda-powertools/logger";
import dayjs from "dayjs";
import DistanceCalculator from "../../helpers/calculateDistance";
import { DriverCurrentLocation, Professional, ProfessionalAvailability, ProfessionalAvailabilityStatus, ProfessionalType, Vehicle } from "../../helpers/types/schema";
import { CuratiLocation } from "../../helpers/types/shared";

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

const ALLOWED_DRIVER_LOCATION_AGE_IN_MINUTES = 30;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 30000; // 30 seconds
const RETRY_BACKOFF_FACTOR = 2;
const MAX_RETRY_DELAY_MS = 300000; // 5 minutes
const LOCATION_BATCH_SIZE = 50;
const LOCATION_CUTOFF_TIME = dayjs.utc().subtract(ALLOWED_DRIVER_LOCATION_AGE_IN_MINUTES, 'minute').toISOString();

export const pickBestDriver = async ({ client, logger, pharmacyLocation }: PickBestDriverInput): Promise<PickBestDriverOutput> => {
  let lastError: Error = new Error("All retry attempts failed");
  let attempt = 1;

  while (attempt <= MAX_RETRY_ATTEMPTS) {
    try {
      const { data: availabilityData, errors: availabilityErrors } = await client.models.professionalAvailability.list({
        filter: {
          currentAvailabilityStatus: { eq: ProfessionalAvailabilityStatus.ONLINE },
          professionalType: { eq: ProfessionalType.DRIVER }
        },
        limit: 1000
      });

      if (availabilityErrors || !availabilityData) {
        throw new Error(`Failed to fetch driver availability: ${JSON.stringify(availabilityErrors)}`);
      }

      const availabilities = availabilityData as ProfessionalAvailability[];
      const availableDriverIds = new Set(
        availabilities
          .filter(avail => avail.currentAvailabilityStatus === ProfessionalAvailabilityStatus.ONLINE)
          .map(avail => avail.professionalId)
      );

      if (availableDriverIds.size === 0) {
        throw new Error("No drivers are currently ONLINE");
      }

      logger.info(`Attempt ${attempt}: ${availableDriverIds.size} drivers online`);

      const driverIdsToCheck = Array.from(availableDriverIds);

      const driversLocation = [] as DriverCurrentLocation[];
      for (let i = 0; i < driverIdsToCheck.length; i += LOCATION_BATCH_SIZE) {
        const batch = driverIdsToCheck.slice(i, i + LOCATION_BATCH_SIZE);
        const locationFilters = batch.map(id => ({ driverId: { eq: id } }));

        const { data, errors } = await client.models.driverCurrentLocation.list({
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

      // Calculate distances and sort
      const driversWithDistance = driversLocation.map(loc => ({
        driverId: loc.driverId,
        distance: distanceCalculator.calculateDistance({
          startPoint: pharmacyLocation,
          destination: { lat: loc.latitude, lng: loc.longitude }
        }),
        timestamp: loc.timestamp
      })).sort((a, b) => a.distance - b.distance);

      // Select best candidate (closest + freshest location)
      const bestCandidate = driversWithDistance.reduce((best, current) => {
        if (current.distance < best.distance) return current;
        if (current.distance === best.distance && dayjs(current.timestamp).isAfter(best.timestamp)) return current;
        return best;
      }, driversWithDistance[0]);

      logger.info(`Best candidate: ${bestCandidate.driverId} (${bestCandidate.distance.toFixed(2)}m)`);

      const [vehicleResult, driverResult] = await Promise.allSettled([
        client.models.vehicle.list({ filter: { driverId: { eq: bestCandidate.driverId } } }),
        client.models.professional.get({ userId: bestCandidate.driverId })
      ]);

      if (vehicleResult.status === 'rejected' || !vehicleResult.value.data?.[0]) {
        throw new Error(`Vehicle lookup failed for driver ${bestCandidate.driverId}`);
      }

      if (driverResult.status === 'rejected' || !driverResult.value.data) {
        throw new Error(`Driver details lookup failed for ${bestCandidate.driverId}`);
      }

      return {
        driver: driverResult.value.data as Professional,
        vehicle: vehicleResult.value.data[0] as Vehicle
      };

    } catch (error: any) {
      lastError = error;
      logger.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt === MAX_RETRY_ATTEMPTS) {
        break;
      }

      const delay = Math.min(
        INITIAL_RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_FACTOR, attempt - 1) +
        Math.random() * 10000,
        MAX_RETRY_DELAY_MS
      );

      logger.info(`Retrying in ${Math.round(delay / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw lastError;
};