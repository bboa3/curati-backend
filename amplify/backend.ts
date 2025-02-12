import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { addOrUpdateSearchableRecord } from './functions/add-or-update-searchable-record/resource';
import { addUserToGroup } from './functions/add-user-to-group/resource';
import { adminCreateUser } from './functions/admin-create-user/resource';
import { createStreamToken } from './functions/create-stream-token/resource';
import { deleteSearchableRecord } from './functions/delete-searchable-record/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  addUserToGroup,
  adminCreateUser,
  addOrUpdateSearchableRecord,
  deleteSearchableRecord,
  createStreamToken
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
