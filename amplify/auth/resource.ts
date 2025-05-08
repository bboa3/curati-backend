import { defineAuth } from '@aws-amplify/backend';
import { addUserToGroup } from '../functions/add-user-to-group/resource';
import { adminCreateUser } from '../functions/admin-create-user/resource';
import { customAuthSmsSender } from '../functions/custom-auth-sms-sender/resource';
import { postConfirmation } from './post-confirmation/resource';

const GROUP = ['ADMIN', 'PROFESSIONAL', 'PATIENT'];
const COGNITO_KMS_KEY_ARN = 'arn:aws:kms:us-east-1:050752623432:key/7e1bda99-c598-43ba-b82c-925a39cb1eb0';

export const auth = defineAuth({
  loginWith: {
    phone: true,
  },
  groups: GROUP,
  triggers: {
    postConfirmation
  },
  access: (allow) => [
    allow.resource(addUserToGroup).to(["addUserToGroup"]),
    allow.resource(adminCreateUser).to(["createUser"]),
  ],
  senders: {
    sms: {
      handler: customAuthSmsSender,
      kmsKeyArn: COGNITO_KMS_KEY_ARN
    },
  }
});
