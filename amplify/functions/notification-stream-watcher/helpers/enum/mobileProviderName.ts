import { MobileProviderName } from "../../../helpers/types/schema";

const MobileProviderName_DESCRIPTIONS = new Map<MobileProviderName, string>([
  [MobileProviderName.E_MOLA, 'E-Mola'],
  [MobileProviderName.M_PESA, 'M-Pesa'],
]);

export const convertMobileProviderName = (type: MobileProviderName): string => {
  return MobileProviderName_DESCRIPTIONS.get(type) || '';
};
