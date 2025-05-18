import { defineFunction } from "@aws-amplify/backend";

export const medicineOrderStreamWatcher = defineFunction({
  name: "medicine-order-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60
});