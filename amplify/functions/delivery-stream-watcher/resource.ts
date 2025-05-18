import { defineFunction } from "@aws-amplify/backend";

export const deliveryStreamWatcher = defineFunction({
  name: "delivery-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 5, // 5 minutes
  environment: {
    DRIVER_COMMISSION_PERCENTAGE: '0.8'
  }
});