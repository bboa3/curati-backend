interface TotalDurationCalculationParams {
  pharmacyToPatientDurationMinutes: number;
  driverToPharmacyDistance: number;
  baseSpeedKph?: number;
  trafficFactor?: number;
  pickupBufferMinutes?: number;
  routingFactor?: number;
}

/**
 * Calculates an estimated total duration for a delivery opportunity, in minutes.
 *
 * The formula is: driverTravelTime + pharmacyToPatientDurationMinutes + pickupBufferMinutes
 *
 * driverTravelTime is calculated as the driverToPharmacyDistance divided by an
 * effective speed, which is the baseSpeedKph divided by the trafficFactor.
 * The driverToPharmacyDistance is adjusted by the routingFactor.
 *
 * The total duration is then rounded up to the nearest 5 minutes.
 *
 * @param {object} params An object with the following properties:
 * @param {number} params.pharmacyToPatientDurationMinutes The precalculated and saved duration of the delivery from the pharmacy to the patient in minutes
 * @param {number} params.driverToPharmacyDistance The distance from the driver to the pharmacy in kilometers
 * @param {number} [params.baseSpeedKph=40] The base speed of the driver in kilometers per hour
 * @param {number} [params.trafficFactor=1.2] A factor to adjust the speed for traffic
 * @param {number} [params.pickupBufferMinutes=10] The buffer time in minutes for the driver to pick up the delivery at the pharmacy
 * @param {number} [params.routingFactor=1.2] A factor to adjust the driver distance for routing
 * @returns {number} The estimated total duration for the delivery opportunity in minutes, rounded up to the nearest 5 minutes
 */
export const calculateTotalEstimatedDuration = ({
  pharmacyToPatientDurationMinutes,
  driverToPharmacyDistance,
  baseSpeedKph = 40,
  trafficFactor = 1.2,
  pickupBufferMinutes = 10,
  routingFactor = 1.2
}: TotalDurationCalculationParams): number => {
  const adjustedDriverDistance = driverToPharmacyDistance * routingFactor;

  const effectiveSpeed = baseSpeedKph / trafficFactor;
  const driverTravelTime = (adjustedDriverDistance / effectiveSpeed) * 60;

  const totalMinutes = driverTravelTime + pharmacyToPatientDurationMinutes + pickupBufferMinutes;

  return Math.ceil(totalMinutes / 5) * 5;
};
