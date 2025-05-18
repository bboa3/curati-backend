import { defineFunction } from "@aws-amplify/backend";

export const prescriptionStreamWatcher = defineFunction({
  name: "prescription-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});