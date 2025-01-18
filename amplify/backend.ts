import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { addOrUpdateSearchableRecord } from './functions/add-or-update-searchable-record/resource';
import { addUserToGroup } from './functions/add-user-to-group/resource';
import { adminCreateUser } from './functions/admin-create-user/resource';
import { createStreamToken } from './functions/create-stream-token/resource';
import { deleteSearchableRecord } from './functions/delete-searchable-record/resource';

const backend = defineBackend({
  auth,
  data,
  addUserToGroup,
  adminCreateUser,
  addOrUpdateSearchableRecord,
  deleteSearchableRecord,
  createStreamToken
});


backend.addOutput({
  storage: {
    aws_region: "us-east-1",
    bucket_name: "cura-mz"
  },
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
