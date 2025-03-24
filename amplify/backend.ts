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
  newMedicineOrderPharmacyNotifier
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
const deliveryTablePolicy = new Policy(
  Stack.of(deliveryTable),
  "deliveryTablePolicy",
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
        resources: ["*"],
      }),
    ],
  }
);
backend.newMedicineOrderPharmacyNotifier.resources.lambda.role?.attachInlinePolicy(deliveryTablePolicy);

const mapping = new EventSourceMapping(
  Stack.of(deliveryTable),
  "deliveryTableMapping",
  {
    target: backend.newMedicineOrderPharmacyNotifier.resources.lambda,
    eventSourceArn: deliveryTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);
mapping.node.addDependency(deliveryTablePolicy);