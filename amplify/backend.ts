import { defineBackend } from '@aws-amplify/backend';
import { Stack } from "aws-cdk-lib";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { auth } from './auth/resource';
import { data } from './data/resource';
import { addOrUpdateSearchableRecord } from './functions/add-or-update-searchable-record/resource';
import { addUserToGroup } from './functions/add-user-to-group/resource';
import { adminCreateUser } from './functions/admin-create-user/resource';
import { createStreamToken } from './functions/create-stream-token/resource';
import { deleteSearchableRecord } from './functions/delete-searchable-record/resource';
import { deliveryStreamWatcher } from './functions/delivery-stream-watcher/resource';
import { getSecrets } from './functions/get-secrets/resource';
import { medicineOrderStreamWatcher } from './functions/medicine-order-stream-watcher/resource';
import { prescriptionStreamWatcher } from './functions/prescription-stream-watcher/resource';
import { generateDailySalesSummaries } from './jobs/generate-daily-sales-summaries/resource';
import { generateMonthlySalesSummaries } from './jobs/generate-monthly-sales-summaries/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  addUserToGroup,
  adminCreateUser,
  addOrUpdateSearchableRecord,
  deleteSearchableRecord,
  createStreamToken,
  getSecrets,
  deliveryStreamWatcher,
  prescriptionStreamWatcher,
  medicineOrderStreamWatcher,
  generateDailySalesSummaries,
  generateMonthlySalesSummaries
});

const { cfnUserPool } = backend.auth.resources.cfnResources

cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: false,
    requireNumbers: true,
    requireSymbols: false,
    requireUppercase: false,
  },
};

const deliveryTable = backend.data.resources.tables["delivery"];
const prescriptionTable = backend.data.resources.tables["prescription"];
const medicineOrderTable = backend.data.resources.tables["medicineOrder"];

const deliveryStreamWatcherPolicy = new Policy(Stack.of(deliveryTable), "DeliveryStreamWatcherPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [deliveryTable.tableStreamArn!],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ],
        resources: ["*"],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sns:Publish"],
        resources: ["*"],
      }),
    ],
  }
);

const prescriptionStreamWatcherPolicy = new Policy(Stack.of(prescriptionTable), "PrescriptionStreamWatcherPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [prescriptionTable.tableStreamArn!],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ],
        resources: ["*"],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sns:Publish"],
        resources: ["*"],
      }),
    ],
  }
);

const medicineOrderStreamWatcherPolicy = new Policy(Stack.of(medicineOrderTable), "MedicineOrderStreamWatcherPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ],
        resources: [medicineOrderTable.tableStreamArn!],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ],
        resources: ["*"],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sns:Publish"],
        resources: ["*"],
      }),
    ],
  }
);

backend.deliveryStreamWatcher.resources.lambda.role?.attachInlinePolicy(deliveryStreamWatcherPolicy);
backend.prescriptionStreamWatcher.resources.lambda.role?.attachInlinePolicy(prescriptionStreamWatcherPolicy);
backend.medicineOrderStreamWatcher.resources.lambda.role?.attachInlinePolicy(medicineOrderStreamWatcherPolicy);

const deliveryStreamWatcherMapping = new EventSourceMapping(Stack.of(deliveryTable), "DeliveryStreamWatcherMapping",
  {
    target: backend.deliveryStreamWatcher.resources.lambda,
    eventSourceArn: deliveryTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);
const prescriptionStreamWatcherMapping = new EventSourceMapping(Stack.of(prescriptionTable), "PrescriptionStreamWatcherMapping",
  {
    target: backend.prescriptionStreamWatcher.resources.lambda,
    eventSourceArn: prescriptionTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

const medicineOrderStreamWatcherMapping = new EventSourceMapping(Stack.of(medicineOrderTable), "MedicineOrderStreamWatcherMapping",
  {
    target: backend.medicineOrderStreamWatcher.resources.lambda,
    eventSourceArn: medicineOrderTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

deliveryStreamWatcherMapping.node.addDependency(deliveryStreamWatcherPolicy);
prescriptionStreamWatcherMapping.node.addDependency(prescriptionStreamWatcherPolicy);
medicineOrderStreamWatcherMapping.node.addDependency(medicineOrderStreamWatcherPolicy);