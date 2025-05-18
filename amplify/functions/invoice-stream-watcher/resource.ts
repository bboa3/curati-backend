import { defineFunction } from "@aws-amplify/backend";

export const invoiceStreamWatcher = defineFunction({
  name: "invoice-stream-watcher",
  resourceGroupName: "data",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});