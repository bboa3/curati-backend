import { defineFunction } from "@aws-amplify/backend";

export const deliveryAssignmentStreamWatcher = defineFunction({
  name: "delivery-assignment-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 2, // 2 minutes
});