import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'curatiStorage',

  access: (allow) => ({
    'patients/*': [
      allow.groups(['ADMIN', 'PROFESSIONAL', 'PATIENT']).to(['read', 'write', 'delete']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'professionals/*': [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT']).to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'pharmacies/*': [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT']).to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'hospitals/*': [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT']).to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'couriers/*': [
      allow.groups(['ADMIN', 'PROFESSIONAL']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT']).to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'admins/*': [
      allow.groups(['ADMIN']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT', 'PROFESSIONAL']).to(['read']),
      allow.authenticated.to(['read']),
      allow.guest.to(['read'])
    ],
    'articles/*': [
      allow.groups(['ADMIN']).to(['read', 'write', 'delete']),
      allow.groups(['PATIENT', 'PROFESSIONAL']).to(['read']),
      allow.authenticated.to(['read']),
      allow.guest.to(['read'])
    ],
  })
});