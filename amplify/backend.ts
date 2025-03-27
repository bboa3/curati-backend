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
import { postMedicineOrderCreation } from './functions/post-medicine-order-creation/resource';
import { postPrescriptionCreation } from './functions/post-prescription-creation/resource';
import { postPrescriptionValidation } from './functions/post-prescription-validation/resource';
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
  postMedicineOrderCreation,
  postPrescriptionCreation,
  postPrescriptionValidation
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

const medicineOrderTable = backend.data.resources.tables["medicineOrder"];
const prescriptionTable = backend.data.resources.tables["prescription"];

const postMedicineOrderCreationPolicy = new Policy(Stack.of(medicineOrderTable), "PostMedicineOrderCreationPolicy",
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

const postPrescriptionCreationPolicy = new Policy(Stack.of(prescriptionTable), "PostPrescriptionCreationPolicy",
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


const postPrescriptionValidationPolicy = new Policy(Stack.of(prescriptionTable), "PostPrescriptionValidationPolicy",
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

backend.postMedicineOrderCreation.resources.lambda.role?.attachInlinePolicy(postMedicineOrderCreationPolicy);
backend.postPrescriptionCreation.resources.lambda.role?.attachInlinePolicy(postPrescriptionCreationPolicy);
backend.postPrescriptionValidation.resources.lambda.role?.attachInlinePolicy(postPrescriptionValidationPolicy);

const postMedicineOrderCreationMapping = new EventSourceMapping(Stack.of(medicineOrderTable), "PostMedicineOrderCreationMapping",
  {
    target: backend.postMedicineOrderCreation.resources.lambda,
    eventSourceArn: medicineOrderTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);
const postPrescriptionCreationMapping = new EventSourceMapping(Stack.of(prescriptionTable), "PostPrescriptionCreationMapping",
  {
    target: backend.postPrescriptionCreation.resources.lambda,
    eventSourceArn: prescriptionTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

const postPrescriptionValidationMapping = new EventSourceMapping(Stack.of(prescriptionTable), "PostPrescriptionValidationMapping",
  {
    target: backend.postPrescriptionValidation.resources.lambda,
    eventSourceArn: prescriptionTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

postMedicineOrderCreationMapping.node.addDependency(postMedicineOrderCreationPolicy);
postPrescriptionCreationMapping.node.addDependency(postPrescriptionCreationPolicy);
postPrescriptionValidationMapping.node.addDependency(postPrescriptionValidationPolicy);