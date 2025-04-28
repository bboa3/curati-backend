import { Coordinate } from "./types/shared";

interface ICalculateDistance {
  startPoint: Coordinate;
  destination: Coordinate;
}

export interface DeliveryRoute {
  km: number;
  duration: number;
}

export default class DistanceCalculator {
  private readonly EARTH_RADIUS_MI = 3958.8; // Earth radius in miles
  private readonly MILES_TO_KM = 1.60934;

  milesToKilometers(miles: number): number {
    return miles * this.MILES_TO_KM;
  }

  kilometersToMiles(km: number): number {
    return km / this.MILES_TO_KM;
  }

  convertSecondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
  }

  calculateDistance({ startPoint, destination }: ICalculateDistance) {
    const φ1 = startPoint.lat * Math.PI / 180;
    const φ2 = destination.lat * Math.PI / 180;
    const Δφ = (destination.lat - startPoint.lat) * Math.PI / 180;
    const Δλ = (destination.lng - startPoint.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_MI * c;
  }

  calculateAndFormatDistance({ startPoint, destination }: ICalculateDistance) {
    const distance = this.calculateDistance({ startPoint, destination });
    const km = this.milesToKilometers(distance);

    if (km < 1) {
      return `${(km * 1000).toFixed(2)} m`;
    }

    return `${km.toFixed(2)} km`;
  }

  calculateAndFormatDistanceInKm({ startPoint, destination }: ICalculateDistance) {
    const distance = this.calculateDistance({ startPoint, destination });
    return this.milesToKilometers(distance);
  }
}