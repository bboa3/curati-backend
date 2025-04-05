import { VehicleType } from "../../helpers/types/schema";

const VEHICLE_TYPE_DESCRIPTIONS = new Map<VehicleType, string>([
  [VehicleType.CAR, 'Carro'],
  [VehicleType.MOTORCYCLE, 'Moto'],
  [VehicleType.BICYCLE, 'Bicicleta'],
  [VehicleType.TRUCK, 'Caminhão'],
]);

export const convertVehicleType = (type: VehicleType): string => {
  return VEHICLE_TYPE_DESCRIPTIONS.get(type) || '';
};
