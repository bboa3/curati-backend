import { defineAuth } from '@aws-amplify/backend';
import { addUserToGroup } from '../functions/add-user-to-group/resource';
import { adminCreateUser } from '../functions/admin-create-user/resource';
import { customAuthSmsSender } from '../functions/custom-auth-sms-sender/resource';
import { postConfirmation } from './post-confirmation/resource';

const GROUP = ['ADMIN', 'PROFESSIONAL', 'PATIENT'];

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
      // kmsKeyArn: 'arn:aws:kms:us-east-1:050752623432:key/d2b2ea17-5c42-4ad5-86a0-5df4634c1301'
    },
  }
});
