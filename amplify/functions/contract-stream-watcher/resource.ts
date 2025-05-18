import { defineFunction } from "@aws-amplify/backend";

export const contractStreamWatcher = defineFunction({
  name: "contract-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});