import { defineFunction } from "@aws-amplify/backend";

export const newMedicineOrderPharmacyNotifier = defineFunction({
  name: "new-medicine-order-pharmacy-notifier",
  resourceGroupName: "data",
  entry: "./handler.ts"
});