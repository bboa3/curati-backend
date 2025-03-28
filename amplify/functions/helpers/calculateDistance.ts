import { CuratiLocation } from "./types/shared";

interface ICalculateDistance {
  startPoint: CuratiLocation;
  destination: CuratiLocation;
}

export interface DeliveryRoute {
  distanceInKm: number;
  duration: number;
}

export default class DistanceCalculator {
  convertMilesToKilometers(meters: number): number {
    return meters / 1000;
  }

  convertSecondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
  }

  calculateDistance({ startPoint, destination }: ICalculateDistance) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = startPoint.lat * Math.PI / 180;
    const φ2 = destination.lat * Math.PI / 180;
    const Δφ = (destination.lat - startPoint.lat) * Math.PI / 180;
    const Δλ = (destination.lng - startPoint.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
  }

  calculateAndFormatDistance({ startPoint, destination }: ICalculateDistance) {
    const distance = this.calculateDistance({ startPoint, destination });
    const distanceInKm = this.convertMilesToKilometers(distance);

    if (distanceInKm < 1) {
      return `${(distanceInKm * 1000).toFixed(2)} m`;
    }

    return `${distanceInKm.toFixed(2)} km`;
  }
}