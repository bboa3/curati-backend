import { defineBackend } from '@aws-amplify/backend';
import { Stack } from "aws-cdk-lib";
import { AccountRootPrincipal, Effect, Policy, PolicyDocument, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from 'aws-cdk-lib/aws-kms';
import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { auth } from './auth/resource';
import { data } from './data/resource';
import { addOrUpdateSearchableRecord } from './functions/add-or-update-searchable-record/resource';
import { addUserToGroup } from './functions/add-user-to-group/resource';
import { adminCreateUser } from './functions/admin-create-user/resource';
import { appointmentStreamWatcher } from './functions/appointment-stream-watcher/resource';
import { contractStreamWatcher } from './functions/contract-stream-watcher/resource';
import { createStreamToken } from './functions/create-stream-token/resource';
import { customAuthSmsSender } from './functions/custom-auth-sms-sender/resource';
import { deleteSearchableRecord } from './functions/delete-searchable-record/resource';
import { deliveryAssignmentStreamWatcher } from './functions/delivery-assignment-stream-watcher/resource';
import { deliveryStreamWatcher } from './functions/delivery-stream-watcher/resource';
import { getSecrets } from './functions/get-secrets/resource';
import { invoiceStreamWatcher } from './functions/invoice-stream-watcher/resource';
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
  customAuthSmsSender,
  addOrUpdateSearchableRecord,
  deleteSearchableRecord,
  createStreamToken,
  getSecrets,
  deliveryStreamWatcher,
  prescriptionStreamWatcher,
  invoiceStreamWatcher,
  contractStreamWatcher,
  deliveryAssignmentStreamWatcher,
  appointmentStreamWatcher,
  medicineOrderStreamWatcher,
  generateDailySalesSummaries,
  generateMonthlySalesSummaries,
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
const contractTable = backend.data.resources.tables["contract"];
const appointmentTable = backend.data.resources.tables["appointment"];
const invoiceTable = backend.data.resources.tables["invoice"];
const deliveryAssignmentTable = backend.data.resources.tables["deliveryAssignment"];


const cognitoKey = new Key(backend.auth.stack, 'CognitoSmsKey', {
  enableKeyRotation: true,
  policy: new PolicyDocument({
    statements: [
      new PolicyStatement({
        actions: ['kms:*'],
        principals: [new AccountRootPrincipal()],
        resources: ['*']
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['kms:GenerateDataKey', 'kms:Encrypt'],
        principals: [new ServicePrincipal('cognito-idp.amazonaws.com')],
        resources: ['*']
      })
    ]
  })
});

cognitoKey.grantDecrypt(backend.customAuthSmsSender.resources.lambda.role!);

backend.customAuthSmsSender.resources.lambda.addPermission('CognitoInvoke', {
  principal: new ServicePrincipal('cognito-idp.amazonaws.com'),
  sourceArn: backend.auth.resources.userPool.userPoolArn
});

backend.auth.resources.cfnResources.cfnUserPool.addPropertyOverride(
  'LambdaConfig.CustomSMSSender',
  {
    LambdaArn: backend.customAuthSmsSender.resources.lambda.functionArn,
    LambdaVersion: 'V1_0',
    KmsKeyId: cognitoKey.keyArn
  }
);

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

const contractStreamWatcherPolicy = new Policy(Stack.of(contractTable), "ContractStreamWatcherPolicy",
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
        resources: [contractTable.tableStreamArn!],
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

const appointmentStreamWatcherPolicy = new Policy(Stack.of(appointmentTable), "AppointmentStreamWatcherPolicy",
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
        resources: [appointmentTable.tableStreamArn!],
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

const invoiceStreamWatcherPolicy = new Policy(Stack.of(invoiceTable), "InvoiceStreamWatcherPolicy",
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
        resources: [invoiceTable.tableStreamArn!],
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

const deliveryAssignmentStreamWatcherPolicy = new Policy(Stack.of(deliveryAssignmentTable), "DeliveryAssignmentStreamWatcherPolicy",
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
        resources: [deliveryAssignmentTable.tableStreamArn!],
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
backend.contractStreamWatcher.resources.lambda.role?.attachInlinePolicy(contractStreamWatcherPolicy);
backend.appointmentStreamWatcher.resources.lambda.role?.attachInlinePolicy(appointmentStreamWatcherPolicy);
backend.invoiceStreamWatcher.resources.lambda.role?.attachInlinePolicy(invoiceStreamWatcherPolicy);
backend.deliveryAssignmentStreamWatcher.resources.lambda.role?.attachInlinePolicy(deliveryAssignmentStreamWatcherPolicy);

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

const contractStreamWatcherMapping = new EventSourceMapping(Stack.of(contractTable), "ContractStreamWatcherMapping",
  {
    target: backend.contractStreamWatcher.resources.lambda,
    eventSourceArn: contractTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

const appointmentStreamWatcherMapping = new EventSourceMapping(Stack.of(appointmentTable), "AppointmentStreamWatcherMapping",
  {
    target: backend.appointmentStreamWatcher.resources.lambda,
    eventSourceArn: appointmentTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

const invoiceStreamWatcherMapping = new EventSourceMapping(Stack.of(invoiceTable), "InvoiceStreamWatcherMapping",
  {
    target: backend.invoiceStreamWatcher.resources.lambda,
    eventSourceArn: invoiceTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

const deliveryAssignmentStreamWatcherMapping = new EventSourceMapping(Stack.of(deliveryAssignmentTable), "DeliveryAssignmentStreamWatcherMapping",
  {
    target: backend.deliveryAssignmentStreamWatcher.resources.lambda,
    eventSourceArn: deliveryAssignmentTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

deliveryStreamWatcherMapping.node.addDependency(deliveryStreamWatcherPolicy);
prescriptionStreamWatcherMapping.node.addDependency(prescriptionStreamWatcherPolicy);
medicineOrderStreamWatcherMapping.node.addDependency(medicineOrderStreamWatcherPolicy);
contractStreamWatcherMapping.node.addDependency(contractStreamWatcherPolicy);
appointmentStreamWatcherMapping.node.addDependency(appointmentStreamWatcherPolicy);
invoiceStreamWatcherMapping.node.addDependency(invoiceStreamWatcherPolicy);
deliveryAssignmentStreamWatcherMapping.node.addDependency(deliveryAssignmentStreamWatcherPolicy);