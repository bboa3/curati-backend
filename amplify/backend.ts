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
import { getSecrets } from './functions/get-secrets/resource';
import { newMedicineOrderPharmacyNotifier } from './functions/newMedicineOrderPharmacyNotifier/resource';
import { newPrescriptionAdminNotifier } from './functions/newPrescriptionAdminNotifier/resource';
import { newValidatedPrescriptionPatientNotifier } from './functions/newValidatedPrescriptionPatientNotifier/resource';
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
  newMedicineOrderPharmacyNotifier,
  newPrescriptionAdminNotifier,
  newValidatedPrescriptionPatientNotifier
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

const newMedicineOrderPharmacyNotifierPolicy = new Policy(
  Stack.of(deliveryTable),
  "NewMedicineOrderPharmacyNotifierPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
          "dynamodb:GetItem"
        ],
        resources: [deliveryTable.tableStreamArn!, deliveryTable.tableArn!],
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
const newPrescriptionAdminNotifierPolicy = new Policy(
  Stack.of(prescriptionTable),
  "NewPrescriptionAdminNotifierPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
          "dynamodb:GetItem"
        ],
        resources: [prescriptionTable.tableStreamArn!, prescriptionTable.tableArn!],
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
const newValidatedPrescriptionPatientNotifierPolicy = new Policy(
  Stack.of(prescriptionTable),
  "NewValidatedPrescriptionPatientNotifierPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
          "dynamodb:GetItem"
        ],
        resources: [prescriptionTable.tableStreamArn!, prescriptionTable.tableArn!],
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

backend.newMedicineOrderPharmacyNotifier.resources.lambda.role?.attachInlinePolicy(newMedicineOrderPharmacyNotifierPolicy);
backend.newPrescriptionAdminNotifier.resources.lambda.role?.attachInlinePolicy(newPrescriptionAdminNotifierPolicy);
backend.newValidatedPrescriptionPatientNotifier.resources.lambda.role?.attachInlinePolicy(newValidatedPrescriptionPatientNotifierPolicy);

const newMedicineOrderPharmacyNotifierMapping = new EventSourceMapping(
  Stack.of(deliveryTable),
  "NewMedicineOrderPharmacyNotifierMapping",
  {
    target: backend.newMedicineOrderPharmacyNotifier.resources.lambda,
    eventSourceArn: deliveryTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);
const newPrescriptionAdminNotifierMapping = new EventSourceMapping(
  Stack.of(prescriptionTable),
  "NewPrescriptionAdminNotifierMapping",
  {
    target: backend.newPrescriptionAdminNotifier.resources.lambda,
    eventSourceArn: prescriptionTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);
const newValidatedPrescriptionPatientNotifierMapping = new EventSourceMapping(
  Stack.of(prescriptionTable),
  "NewValidatedPrescriptionPatientNotifierMapping",
  {
    target: backend.newValidatedPrescriptionPatientNotifier.resources.lambda,
    eventSourceArn: prescriptionTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

newMedicineOrderPharmacyNotifierMapping.node.addDependency(newMedicineOrderPharmacyNotifierPolicy);
newPrescriptionAdminNotifierMapping.node.addDependency(newPrescriptionAdminNotifierPolicy);
newValidatedPrescriptionPatientNotifierMapping.node.addDependency(newValidatedPrescriptionPatientNotifierPolicy);