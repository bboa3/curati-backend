import { defineAuth } from '@aws-amplify/backend';
import { addUserToGroup } from '../functions/add-user-to-group/resource';
import { adminCreateUser } from '../functions/admin-create-user/resource';
import { customSmsSender } from '../functions/custom-sms-sender/resource';
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
      handler: customSmsSender
    },
  }
});
