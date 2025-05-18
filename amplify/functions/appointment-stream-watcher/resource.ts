import { defineFunction } from "@aws-amplify/backend";

export const appointmentStreamWatcher = defineFunction({
  name: "appointment-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60
});